import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import vision from "@google-cloud/vision";
import path from "path";
import fs from "fs";

// Initialize Vision Client using credentials (env var on Vercel or local file fallback)
let visionConfig = {};
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    visionConfig = { credentials };
  } catch (err) {
    console.error("Failed to parse GOOGLE_CREDENTIALS_JSON in scan-slip API:", err);
  }
} else {
  const credentialsPath = path.join(process.cwd(), "google-credentials.json");
  if (fs.existsSync(credentialsPath)) {
    visionConfig = { keyFilename: credentialsPath };
  } else {
    console.warn("Google credentials file not found and GOOGLE_CREDENTIALS_JSON is not set.");
  }
}
const visionClient = new vision.ImageAnnotatorClient(visionConfig);

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "กรุณาอัปโหลดรูปภาพสลิปมิว~" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Call Cloud Vision OCR
    const [result] = await visionClient.textDetection({
      image: { content: buffer },
    });
    
    const detections = result.textAnnotations;
    const fullText = detections.length > 0 ? detections[0].description : "";

    if (!fullText) {
      return NextResponse.json({ error: "เมมไม่พบข้อความใดๆ ในรูปภาพสลิปเลยมิว~ ลองส่งใหม่อีกครั้งนะ" }, { status: 422 });
    }

    // Extract Amount
    let amount = "";
    const amountRegex = /(?:จำนวนเงิน|ยอดโอน|amount|ยอดเงิน|รวมเงิน)[\s:.-]*([0-9,]+(?:\.\d{2})?)/i;
    const match = fullText.match(amountRegex);
    
    if (match) {
      amount = match[1].replace(/,/g, "");
    } else {
      // Fallback: look for the largest number ending in .00
      const numMatches = fullText.match(/[0-9,]+\.\d{2}/g);
      if (numMatches) {
        let maxNum = 0;
        for (const numStr of numMatches) {
          const num = parseFloat(numStr.replace(/,/g, ""));
          if (num > maxNum) maxNum = num;
        }
        if (maxNum > 0) amount = maxNum.toString();
      }
    }

    // Extract Date (DD/MM/YYYY)
    let dateObj = new Date(); // Default to today
    let finalDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;

    // Attempt to find a date string in DD/MM/YYYY, DD/MM/YY
    const dateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/;
    const dateMatch = fullText.match(dateRegex);
    if (dateMatch) {
      let d = parseInt(dateMatch[1], 10);
      let m = parseInt(dateMatch[2], 10);
      let y = parseInt(dateMatch[3], 10);
      if (y < 100) y += 2000;
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        finalDate = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
      }
    }

    return NextResponse.json({
      success: true,
      amount: amount || null,
      date: finalDate,
      rawText: fullText.substring(0, 500), // send first 500 chars for debugging if needed
    });
  } catch (error) {
    console.error("Error in POST /api/scan-slip:", error);
    
    if (error.message && error.message.includes("Cloud Vision API has not been used")) {
      return NextResponse.json({ 
        error: "ผู้ดูแลระบบยังไม่ได้เปิดใช้งาน Cloud Vision API ในบัญชี Google Console มิว~" 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: "แงง... เมมตาลายไปหมดแล้ว อ่านสลิปไม่ได้มิว!" }, { status: 500 });
  }
}


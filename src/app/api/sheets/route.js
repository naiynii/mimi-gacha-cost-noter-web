import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getSummary, getUserGames, addRecord, deleteRecord } from "../../../utils/googleSheets";
import { v4 as uuidv4 } from "uuid";

// GET handler: Fetch all records and games for the authenticated user
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const gameFilter = searchParams.get("game") || null;

  try {
    const summary = await getSummary(userId, gameFilter);
    const games = await getUserGames(userId);
    
    return NextResponse.json({
      total: summary.total,
      items: summary.items,
      games: games
    });
  } catch (error) {
    console.error("Error in GET /api/sheets:", error);
    return NextResponse.json({ error: "Failed to fetch data from Google Sheets" }, { status: 500 });
  }
}

// POST handler: Add a new top-up record
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const username = session.user.name || "Unknown User";

  try {
    const body = await request.json();
    const { amount, date, game, detail, remark } = body;

    // Validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: "ยอดเงินต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0 มิว~" }, { status: 400 });
    }

    // Default Date to today if empty
    let finalDate = date;
    if (!finalDate || finalDate.trim() === "") {
      const today = new Date();
      finalDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    } else {
      // Validate Date Format (DD/MM/YYYY)
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
      if (!dateRegex.test(finalDate)) {
        return NextResponse.json({ error: "รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น DD/MM/YYYY เท่านั้นมิว~" }, { status: 400 });
      }
    }

    if (!game || game.trim() === "") {
      return NextResponse.json({ error: "กรุณาระบุชื่อเกมมิว~" }, { status: 400 });
    }

    if (!detail || detail.trim() === "") {
      return NextResponse.json({ error: "กรุณาระบุรายละเอียดของที่ได้มามิว~" }, { status: 400 });
    }

    const newRecord = {
      ID: uuidv4(),
      Timestamp: new Date().toISOString(),
      Topup_Date: finalDate,
      User_ID: userId,
      Username: username,
      Game_Name: game.trim(),
      Total_Amount: parsedAmount,
      Items_Detail: detail.trim(),
      Remark: remark ? remark.trim() : ""
    };

    await addRecord(newRecord);

    return NextResponse.json({ success: true, record: newRecord });
  } catch (error) {
    console.error("Error in POST /api/sheets:", error);
    return NextResponse.json({ error: "Failed to add record to Google Sheets" }, { status: 500 });
  }
}

// DELETE handler: Remove a record by ID
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
    }

    const success = await deleteRecord(id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "ไม่พบรายการดังกล่าวมิว~" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in DELETE /api/sheets:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}

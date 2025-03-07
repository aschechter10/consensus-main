import { Consensi } from "@/lib/datalayer";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const consensi = new Consensi();

export async function GET() {
  const session = await getServerSession();

  if (
    !session ||
    session.user?.image === "anonymous" ||
    (session.user?.email !== process.env.ARI_ADMIN &&
      session.user?.email !== process.env.JACK_ADMIN &&
      session.user?.email !== process.env.GUS_ADMIN &&
      session.user?.email !== process.env.WALDEN_ADMIN &&
      session.user?.email !== process.env.STEVE_ADMIN &&
      session.user?.email !== process.env.BMO_ADMIN)
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const highestConsensusNum = await consensi.getHighestConsensusNum();
    return NextResponse.json({ highestConsensusNum });
  } catch (error) {
    console.error("Error fetching highest consensus number:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (
    !session ||
    session.user?.image === "anonymous" ||
    (session.user?.email !== process.env.ARI_ADMIN &&
      session.user?.email !== process.env.JACK_ADMIN &&
      session.user?.email !== process.env.GUS_ADMIN &&
      session.user?.email !== process.env.WALDEN_ADMIN &&
      session.user?.email !== process.env.STEVE_ADMIN &&
      session.user?.email !== process.env.BMO_ADMIN)
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const consensusDate = data.metadata.date

    if(consensusDate != "null") {
      //console.log('date', consensusDate)
      const existingConsensus = await consensi.getTodaysConsensiByDate(consensusDate);
      //console.log('existing:', existingConsensus)
      if (existingConsensus.length > 0) {
        return NextResponse.json(
            { error: "Consensus already scheduled for that day" },
            { status: 400 }
        );
      }
    } else {
      const nextDate = await consensi.getNextDate()

      const cleanedDate = nextDate.trim().replace(/\u200B/g, "");

      const latestDate = new Date(cleanedDate);

      latestDate.setDate(latestDate.getDate() + 1);
      data.metadata.date = latestDate.toISOString().split("T")[0];
    }

    await consensi.saveConsensus(data);
    return NextResponse.json({
      message: "Consensus saved successfully",
      consensusData: data,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

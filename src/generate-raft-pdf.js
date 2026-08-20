const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "../data/learning_os.db");
const db = new Database(dbPath);

async function generateRaftPdf() {
  const doc = await PDFDocument.create();
  const primaryColor = rgb(0.55, 0.2, 0.9);
  const textColor = rgb(0.12, 0.14, 0.17);
  const subColor = rgb(0.4, 0.45, 0.5);

  const hBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const hRegular = await doc.embedFont(StandardFonts.Helvetica);
  const hItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pages = [
    {
      heading: "Section 1: In Search of an Understandable Consensus Algorithm",
      paragraphs: [
        "Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to (multi-)Paxos, and it is as efficient as Paxos, but its structure is different from Paxos; this makes Raft more understandable than Paxos and also provides a better foundation for building practical systems.",
        "To enhance understandability, Raft decomposes consensus into relatively independent subproblems, including leader election, log replication, safety, and membership changes.",
      ],
    },
    {
      heading: "Section 5.2: Leader Election & Quorums",
      paragraphs: [
        "Raft uses a heartbeat mechanism to trigger leader election. When servers start up, they begin as followers. A server remains in follower state as long as it receives valid RPCs from a leader or candidate.",
        "To begin an election, a follower increments its current term and transitions to candidate state. It then votes for itself and issues RequestVote RPCs in parallel to each of the other servers in the cluster.",
        "A candidate wins an election if it receives votes from a majority of the servers in the full cluster for the same term: Quorum = floor(N/2) + 1.",
      ],
    },
    {
      heading: "Section 5.4: Safety & Leader Completeness Invariant",
      paragraphs: [
        "Raft guarantees the Leader Completeness Property: if a log entry is committed in a given term, then that entry will be present in the logs of the leaders for all higher-numbered terms.",
        "A voter denies its vote if the candidate's log is less up-to-date than the voter's own log: RequestVote RPC includes candidate log length and term.",
      ],
    },
  ];

  for (let i = 0; i < pages.length; i++) {
    const pDef = pages[i];
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 40,
      y: height - 60,
      width: width - 80,
      height: 2,
      color: primaryColor,
    });

    if (i === 0) {
      page.drawText("In Search of an Understandable Consensus Protocol (Raft)", {
        x: 40,
        y: height - 100,
        size: 16,
        font: hBold,
        color: primaryColor,
      });

      page.drawText("Diego Ongaro and John Ousterhout — Stanford University", {
        x: 40,
        y: height - 120,
        size: 10,
        font: hItalic,
        color: subColor,
      });
    }

    const headingY = i === 0 ? height - 170 : height - 100;
    page.drawText(pDef.heading, {
      x: 40,
      y: headingY,
      size: 13,
      font: hBold,
      color: primaryColor,
    });

    let currentY = headingY - 26;
    for (const p of pDef.paragraphs) {
      const words = p.split(" ");
      let line = "";
      for (const w of words) {
        const testLine = line + (line ? " " : "") + w;
        if (testLine.length > 78) {
          page.drawText(line, { x: 40, y: currentY, size: 10.5, font: hRegular, color: textColor });
          line = w;
          currentY -= 16;
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, { x: 40, y: currentY, size: 10.5, font: hRegular, color: textColor });
        currentY -= 24;
      }
    }

    page.drawText(`Raft Paper • Page ${i + 1} of ${pages.length}`, { x: 40, y: 40, size: 8.5, font: hRegular, color: subColor });
  }

  const pdfBytes = await doc.save();
  const filePath = path.join(__dirname, "../public/materials/Raft_Consensus_Protocol_Paper.pdf");
  fs.writeFileSync(filePath, pdfBytes);

  db.prepare(`
    UPDATE material_files
    SET drive_url = '/materials/Raft_Consensus_Protocol_Paper.pdf', size_bytes = ?, page_count = 3
    WHERE id = 'mat-raft-02'
  `).run(pdfBytes.length);

  console.log("Raft PDF created and linked successfully.");
}

generateRaftPdf();

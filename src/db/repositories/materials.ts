import { db } from "../sqlite";

export interface MaterialFileRecord {
  id: string;
  userId: string;
  subjectId: string | null;
  subjectTitle?: string;
  subjectColor?: string;
  semester?: number;
  courseType?: string;
  sks?: number;
  topicId: string | null;
  topicTitle?: string;
  name: string;
  mimeType: string;
  driveFileId: string | null;
  driveUrl: string | null;
  sizeBytes: number;
  status: "pending" | "processing" | "completed" | "failed";
  processingError: string | null;
  rawText: string | null;
  pageCount: number;
  chunksCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialChunkRecord {
  id: string;
  materialId: string;
  chunkIndex: number;
  pageNumber: number;
  sectionHeading: string | null;
  content: string;
  tokenCount: number;
  createdAt: string;
}

export interface MaterialNoteRecord {
  id: string;
  userId: string;
  materialId: string;
  pageNumber: number | null;
  highlightText: string | null;
  noteMarkdown: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export const materialsRepo = {
  getAll(userId: string = "demo-user-1"): MaterialFileRecord[] {
    const rows = db.prepare(`
      SELECT 
        m.*,
        s.title as subject_title,
        s.color as subject_color,
        s.semester as subject_semester,
        s.course_type as subject_course_type,
        s.sks as subject_sks,
        tp.title as topic_title,
        COUNT(c.id) as chunks_count
      FROM material_files m
      LEFT JOIN subjects s ON s.id = m.subject_id
      LEFT JOIN topics tp ON tp.id = m.topic_id
      LEFT JOIN material_chunks c ON c.material_id = m.id
      WHERE m.user_id = ?
      GROUP BY m.id
      ORDER BY s.semester ASC, s.order_index ASC, m.created_at DESC
    `).all(userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      semester: r.subject_semester ? Number(r.subject_semester) : 1,
      courseType: r.subject_course_type || "wajib",
      sks: r.subject_sks ? Number(r.subject_sks) : 3,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      name: r.name,
      mimeType: r.mime_type,
      driveFileId: r.drive_file_id,
      driveUrl: r.drive_url,
      sizeBytes: Number(r.size_bytes) || 0,
      status: r.status,
      processingError: r.processing_error,
      rawText: r.raw_text,
      pageCount: Number(r.page_count) || 1,
      chunksCount: Number(r.chunks_count) || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getById(id: string): MaterialFileRecord | null {
    const r = db.prepare(`
      SELECT 
        m.*,
        s.title as subject_title,
        s.color as subject_color,
        s.semester as subject_semester,
        s.course_type as subject_course_type,
        s.sks as subject_sks,
        tp.title as topic_title
      FROM material_files m
      LEFT JOIN subjects s ON s.id = m.subject_id
      LEFT JOIN topics tp ON tp.id = m.topic_id
      WHERE m.id = ?
    `).get(id) as any;

    if (!r) return null;

    return {
      id: r.id,
      userId: r.user_id,
      subjectId: r.subject_id,
      subjectTitle: r.subject_title,
      subjectColor: r.subject_color,
      semester: r.subject_semester ? Number(r.subject_semester) : 1,
      courseType: r.subject_course_type || "wajib",
      sks: r.subject_sks ? Number(r.subject_sks) : 3,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      name: r.name,
      mimeType: r.mime_type,
      driveFileId: r.drive_file_id,
      driveUrl: r.drive_url,
      sizeBytes: Number(r.size_bytes) || 0,
      status: r.status,
      processingError: r.processing_error,
      rawText: r.raw_text,
      pageCount: Number(r.page_count) || 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  getChunks(materialId: string): MaterialChunkRecord[] {
    const rows = db.prepare(`
      SELECT * FROM material_chunks
      WHERE material_id = ?
      ORDER BY chunk_index ASC
    `).all(materialId) as any[];

    return rows.map((r) => ({
      id: r.id,
      materialId: r.material_id,
      chunkIndex: Number(r.chunk_index) || 0,
      pageNumber: Number(r.page_number) || 1,
      sectionHeading: r.section_heading,
      content: r.content,
      tokenCount: Number(r.token_count) || 0,
      createdAt: r.created_at,
    }));
  },

  getNotes(materialId: string, userId: string = "demo-user-1"): MaterialNoteRecord[] {
    const rows = db.prepare(`
      SELECT * FROM material_notes
      WHERE material_id = ? AND user_id = ?
      ORDER BY created_at DESC
    `).all(materialId, userId) as any[];

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      materialId: r.material_id,
      pageNumber: r.page_number ? Number(r.page_number) : null,
      highlightText: r.highlight_text,
      noteMarkdown: r.note_markdown,
      color: r.color || "#fef08a",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  addNote(data: {
    userId?: string;
    materialId: string;
    pageNumber?: number | null;
    highlightText?: string | null;
    noteMarkdown: string;
    color?: string;
  }): MaterialNoteRecord {
    const id = "note-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO material_notes (id, user_id, material_id, page_number, highlight_text, note_markdown, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.materialId,
      data.pageNumber || null,
      data.highlightText || null,
      data.noteMarkdown,
      data.color || "#fef08a",
      now,
      now
    );

    return {
      id,
      userId,
      materialId: data.materialId,
      pageNumber: data.pageNumber || null,
      highlightText: data.highlightText || null,
      noteMarkdown: data.noteMarkdown,
      color: data.color || "#fef08a",
      createdAt: now,
      updatedAt: now,
    };
  },

  create(data: {
    userId?: string;
    subjectId?: string | null;
    topicId?: string | null;
    name: string;
    mimeType: string;
    driveFileId?: string | null;
    driveUrl?: string | null;
    sizeBytes?: number;
    pageCount?: number;
    rawText?: string;
    chunks?: { chunkIndex: number; pageNumber?: number; heading?: string; content: string }[];
  }): MaterialFileRecord {
    const id = "mat-" + Math.random().toString(36).substring(2, 9);
    const userId = data.userId || "demo-user-1";
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO material_files (
        id, user_id, subject_id, topic_id, name, mime_type,
        drive_file_id, drive_url, size_bytes, status, raw_text, page_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.subjectId || null,
      data.topicId || null,
      data.name,
      data.mimeType,
      data.driveFileId || null,
      data.driveUrl || null,
      data.sizeBytes || 0,
      "completed",
      data.rawText || null,
      data.pageCount || 1,
      now,
      now
    );

    if (data.chunks && data.chunks.length > 0) {
      const insertChunk = db.prepare(`
        INSERT INTO material_chunks (id, material_id, chunk_index, page_number, section_heading, content, token_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      data.chunks.forEach((c) => {
        insertChunk.run(
          "chk-" + Math.random().toString(36).substring(2, 9),
          id,
          c.chunkIndex,
          c.pageNumber || 1,
          c.heading || null,
          c.content,
          Math.round(c.content.length / 4),
          now
        );
      });
    }

    return this.getById(id)!;
  },

  delete(id: string): boolean {
    const res = db.prepare(`DELETE FROM material_files WHERE id = ?`).run(id);
    return res.changes > 0;
  },
};

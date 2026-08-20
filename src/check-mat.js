const Database = require('better-sqlite3');
const db = new Database('./data/learning_os.db');

const rows = db.prepare(`
  SELECT 
    m.id, m.name, m.subject_id, m.drive_url,
    s.title as subject_title,
    s.semester as subject_semester,
    s.course_type as subject_course_type,
    s.sks as subject_sks
  FROM material_files m
  LEFT JOIN subjects s ON s.id = m.subject_id
  WHERE m.user_id = 'demo-user-1'
  ORDER BY s.semester ASC, s.order_index ASC
  LIMIT 10
`).all();

rows.forEach(r => {
  console.log({
    id: r.id,
    name: r.name.substring(0, 40),
    subject_title: r.subject_title,
    semester: r.subject_semester,
    course_type: r.subject_course_type,
    drive_url: r.drive_url ? r.drive_url.substring(0, 60) : null
  });
});
const total = db.prepare('SELECT count(*) as c FROM material_files').get();
console.log('\nTotal material files:', total.c);

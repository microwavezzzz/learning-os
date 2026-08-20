const fs = require('fs');
const path = require('path');

const pdfsDir = path.join(__dirname, '../public/pdfs');
const bmsdDir = path.join(pdfsDir, 'bmsd');

// Find all .pdf files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.pdf')) {
      fileList.push({ name: file, fullPath: filePath });
    }
  });
  return fileList;
}

const allPdfs = getAllFiles(pdfsDir);
console.log(`Found ${allPdfs.length} total PDF instances.`);

// Ensure each PDF is also copied to public/pdfs/bmsd/ and public/pdfs/
allPdfs.forEach(pdf => {
  const target1 = path.join(bmsdDir, pdf.name);
  const target2 = path.join(pdfsDir, pdf.name);
  
  if (!fs.existsSync(target1)) {
    fs.copyFileSync(pdf.fullPath, target1);
    console.log(`Copied ${pdf.name} to public/pdfs/bmsd/`);
  }
  if (!fs.existsSync(target2)) {
    fs.copyFileSync(pdf.fullPath, target2);
    console.log(`Copied ${pdf.name} to public/pdfs/`);
  }
});

console.log("All PDF flat mappings ensured.");

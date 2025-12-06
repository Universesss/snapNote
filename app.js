/* Elements */
const dropArea = document.getElementById("dropArea");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const output = document.getElementById("outputText");
const convertBtn = document.getElementById("convertBtn");
const loading = document.getElementById("loading");
const darkToggle = document.getElementById("darkModeToggle");
const bodyElem = document.getElementById("bodyElem");
const navbar = document.getElementById("mainNavbar");

/* ----------------
   DRAG & DROP
   ----------------*/
dropArea.addEventListener("click", () => imageInput.click());

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () =>
  dropArea.classList.remove("dragover")
);
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files && files.length) {
    imageInput.files = files;
    loadPreview();
  }
});

imageInput.addEventListener("change", loadPreview);

function loadPreview() {
  const file = imageInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.classList.remove("d-none");
}

/* ----------------
   OCR PROCESS
   ----------------*/
convertBtn.addEventListener("click", async () => {
  if (!imageInput.files[0]) {
    alert("Lütfen bir görsel seç dostum.");
    return;
  }

  // show loading
  loading.classList.remove("d-none");
  convertBtn.disabled = true;

  try {
    // Recognize (Türkçe kullanmak istersen 'tur' yaz)
    const lang = "eng";
    const result = await Tesseract.recognize(imageInput.files[0], lang, {
      logger: (m) => {
        // console.log(m);
      },
    });

    let text = result.data.text || "";
    text = cleanText(text);
    output.value = text;
  } catch (err) {
    console.error(err);
    alert("OCR sırasında hata oluştu.");
  } finally {
    loading.classList.add("d-none");
    convertBtn.disabled = false;
  }
});

/* ----------------
   TEXT CLEANING
   ----------------*/
function cleanText(t) {
  if (!t) return "";
  return t
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n") // fazla boş satırları tek satıra indir
    .replace(/[ ]{2,}/g, " ") // fazla boşlukları sil
    .replace(/(\d{1,2}:\d{2}).*/g, "") // saat vs gibi başlıkları kırp (basit)
    .trim();
}

/* ----------------
   PDF DOWNLOAD
   ----------------*/
document.getElementById("downloadPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = output.value || "";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 15, 15);
  doc.save("text-output.pdf");
});

/* ----------------
   DOCX DOWNLOAD
   ----------------*/
document.getElementById("downloadDOCX").addEventListener("click", () => {
  const text = output.value || "";
  if (!text.trim()) {
    alert("Metin boş.");
    return;
  }

  const paragraphs = text.split("\n").map((line) => new docx.Paragraph(line));
  const docFile = new docx.Document({ sections: [{ children: paragraphs }] });
  docx.Packer.toBlob(docFile).then((blob) => saveAs(blob, "text-output.docx"));
});

/* ----------------
   DARK MODE TOGGLE (Navbar class swap)
   ----------------*/
darkToggle.addEventListener("change", (e) => {
  const enabled = e.target.checked;

  // toggle body class for general dark styling
  bodyElem.classList.toggle("dark-mode", enabled);

  // swap navbar classes for proper bootstrap dark appearance
  if (enabled) {
    navbar.classList.remove("navbar-light", "bg-light");
    navbar.classList.add("navbar-dark", "bg-dark");
  } else {
    navbar.classList.remove("navbar-dark", "bg-dark");
    navbar.classList.add("navbar-light", "bg-light");
  }
});

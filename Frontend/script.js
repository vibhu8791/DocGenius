const API_URL = "/api/pdf";

// Tool data for dynamic page loading
const toolData = {
    'merge': {
        title: 'Merge PDF files',
        description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
        buttonText: 'Select PDF files',
        processText: 'Merge PDF',
        handler: mergePdf
    },
    'split': {
        title: 'Split PDF',
        description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
        buttonText: 'Select PDF file',
        processText: 'Split PDF',
        handler: splitPdf
    },
    'compress': {
        title: 'Compress PDF',
        description: 'Reduce file size while optimizing for maximal PDF quality.',
        buttonText: 'Select PDF file',
        processText: 'Compress PDF',
        handler: compressPdf
    },
    'jpg-to-pdf': {
        title: 'JPG to PDF',
        description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
        buttonText: 'Select Images',
        processText: 'Convert to PDF',
        handler: uploadJpgToPdf
    },
    'summarize': {
        title: 'Summarize PDF',
        description: 'Get instant summaries and insights from your PDF documents using AI.',
        buttonText: 'Select PDF file',
        processText: 'Summarize',
        handler: summarizePdf
    },
    'pdf-to-word': { title: 'PDF to Word', description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.', buttonText: 'Select PDF file', processText: 'Convert to Word', handler: pdfToWord },
    'pdf-to-ppt': { title: 'PDF to PowerPoint', description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.', buttonText: 'Select PDF file', processText: 'Convert to PPT', handler: pdfToPpt },
    'pdf-to-excel': { title: 'PDF to Excel', description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.', buttonText: 'Select PDF file', processText: 'Convert to Excel', handler: pdfToExcel },
    'word-to-pdf': { title: 'Word to PDF', description: 'Make DOC and DOCX files easy to read by converting them to PDF.', buttonText: 'Select Word files', processText: 'Convert to PDF', handler: wordToPdf },
    'excel-to-pdf': { title: 'Excel to PDF', description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.', buttonText: 'Select Excel files', processText: 'Convert to PDF', handler: excelToPdf },
    'edit': { title: 'Edit PDF', description: 'Add text, images, shapes or freehand annotations to a PDF document.', buttonText: 'Select PDF file', processText: 'Edit PDF', handler: openEditWorkspace },
    'pdf-to-jpg': { title: 'PDF to JPG', description: 'Extract all images from a PDF or convert each page to a JPG image.', buttonText: 'Select PDF file', processText: 'Convert to JPG', handler: pdfToJpg },
    'html-to-pdf': { title: 'HTML to PDF', description: 'Convert web pages or HTML files into high-quality PDF documents.', buttonText: 'Add HTML', processText: 'Convert to PDF', handler: openHtmlUrlModal },
    'translate': {
        title: 'Translate PDF',
        description: 'Translate your PDF documents into over 100 languages instantly.',
        buttonText: 'Select PDF file',
        processText: 'Translate',
        handler: translatePdf
    },
    'compress-image': {
        title: 'Compress Image',
        description: 'Reduce the size of your images while maintaining high quality.',
        buttonText: 'Select Image',
        processText: 'Compress Image',
        handler: compressImage
    }
};

const languages = [
    "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian",
    "Bulgarian", "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)", "Corsican", "Croatian", "Czech", "Danish",
    "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian",
    "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian",
    "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer",
    "Kinyarwanda", "Korean", "Kurdish (Kurmanji)", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian",
    "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian",
    "Odia (Oriya)", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic",
    "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese",
    "Swahili", "Swedish", "Tajik", "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian",
    "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

let currentTool = null;
let uploadedFiles = [];
let processedBlob = null;
let fabricCanvas = null;
let pdfDoc = null;
let currentPageNum = 1;
let pageEdits = {}; // Store edits per page {pageNum: objectsJSON}

// Force Image Compressor card if missing (Another Method)
document.addEventListener('DOMContentLoaded', () => {
    const mainGrid = document.querySelector('main.container');
    if (mainGrid && !document.getElementById('imgCompressCard')) {
        console.log("DocGenius: Injecting missing Image Compressor card...");
        const cardHtml = `
            <a href="tool.html?type=compress-image" class="card" id="imgCompressCard" style="border: 2px solid var(--primary-red); position: relative; overflow: visible;">
                <div style="position: absolute; top: -10px; right: -10px; background: var(--primary-red); color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; z-index: 10; box-shadow: 0 4px 10px rgba(229,50,45,0.4);">NEW</div>
                <div class="card-icon"><i class="fas fa-file-image" style="color: #e5322d;"></i></div>
                <div class="card-content">
                    <h3>Compress Image</h3>
                    <p>Reduce the size of your images without losing quality.</p>
                </div>
            </a>
        `;
        // Insert at the beginning of the grid
        mainGrid.insertAdjacentHTML('afterbegin', cardHtml);
    }
});

// Filter functionality for home page
if (document.querySelectorAll('.filter-btn').length > 0) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
        });
    });
}

// Auth Functionality
const loginModal = document.getElementById('loginModal');
const btnLogin = document.querySelector('.btn-login');
const btnSignup = document.querySelector('.btn-signup');
const closeModal = document.querySelector('.close-modal');
const btnGoogle = document.querySelector('.btn-google');
const toggleAuth = document.getElementById('toggleAuth');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authFooterText = document.getElementById('authFooterText');
const authForm = document.getElementById('authForm');

let isLogin = true;

function openAuthModal(mode = 'login') {
    isLogin = mode === 'login';
    updateAuthUI();
    if (loginModal) loginModal.style.display = 'block';
}

function updateAuthUI() {
    if (isLogin) {
        if (authTitle) authTitle.textContent = "Login to your account";
        if (authSubmitBtn) authSubmitBtn.textContent = "Log in";
        if (authFooterText) authFooterText.textContent = "Don't have an account?";
        if (toggleAuth) toggleAuth.textContent = "Create an account";
    } else {
        if (authTitle) authTitle.textContent = "Create an account";
        if (authSubmitBtn) authSubmitBtn.textContent = "Sign up";
        if (authFooterText) authFooterText.textContent = "Already have an account?";
        if (toggleAuth) toggleAuth.textContent = "Log in";
    }
}

if (btnLogin) btnLogin.onclick = (e) => { e.preventDefault(); openAuthModal('login'); };
if (btnSignup) btnSignup.onclick = (e) => { e.preventDefault(); openAuthModal('signup'); };
if (closeModal) closeModal.onclick = () => loginModal.style.display = 'none';

if (toggleAuth) {
    toggleAuth.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        updateAuthUI();
    };
}

if (btnGoogle) {
    btnGoogle.onclick = () => {
        console.log("Google login attempt");
        alert("Google login successfully! (Simulated)");
        loginModal.style.display = 'none';
    };
}

window.onclick = (event) => {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
};

if (authForm) {
    authForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        console.log(`${isLogin ? 'Login' : 'Signup'} attempt:`, { email, password });
        alert(`${isLogin ? 'Logged in' : 'Account created'} successfully! (Simulated)`);
        loginModal.style.display = 'none';
        authForm.reset();
    };
}

// Tool page initialization
function initToolPage(type) {
    currentTool = type;
    const data = toolData[type];
    if (!data) return;

    const titleEl = document.getElementById('toolTitle');
    const descEl = document.getElementById('toolDescription');
    const btnTextEl = document.getElementById('buttonText');
    
    if(titleEl) titleEl.textContent = data.title;
    if(descEl) descEl.textContent = data.description;
    if(btnTextEl) btnTextEl.textContent = data.buttonText;
    document.title = `DocGenius - ${data.title}`;

    const fileInput = document.getElementById('toolFileInput');
    if(fileInput) {
        fileInput.onchange = (e) => handleFileSelection(e);
    }

    const processBtn = document.getElementById('processBtn');
    if(processBtn) {
        processBtn.onclick = () => data.handler();
        const btnText = document.getElementById('processBtnText');
        if(btnText) btnText.textContent = data.processText;
        const sidebarTitle = document.getElementById('sidebarTitle');
        if(sidebarTitle) sidebarTitle.textContent = data.title;
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if(downloadBtn) {
        downloadBtn.onclick = () => downloadResult();
    }
}

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    uploadedFiles = [...uploadedFiles, ...files];
    showStep('previewSection');
    renderFileList();
}

function renderFileList() {
    const fileList = document.getElementById('filePreviewList');
    if(!fileList) return;
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item-preview';
        div.innerHTML = `
            <div class="file-icon"><i class="fas fa-file-pdf"></i></div>
            <div class="file-name">${file.name}</div>
        `;
        fileList.appendChild(div);
    });
}

function showStep(stepId) {
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    const nextStep = document.getElementById(stepId);
    if(nextStep) nextStep.classList.add('active');
}

function downloadResult() {
    if (!processedBlob) {
        alert("No processed file available for download.");
        return;
    }
    const url = window.URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    
    let extension = 'pdf';
    if (processedBlob.type === 'text/plain') extension = 'txt';
    else if (processedBlob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';
    else if (processedBlob.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') extension = 'pptx';
    else if (processedBlob.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') extension = 'xlsx';
    else if (processedBlob.type === 'application/zip') extension = 'zip';
    
    a.download = `DocGenius_${currentTool}_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

async function handleResponse(response, successMessage) {
    if (response.ok) {
        processedBlob = await response.blob();
        document.getElementById('downloadTitle').textContent = successMessage;
        showStep('downloadSection');
    } else {
        const errorText = await response.text();
        alert("Error: " + (errorText || "Processing failed"));
        showStep('previewSection');
    }
}

// Edit PDF Workspace Logic
async function openEditWorkspace() {
    if (uploadedFiles.length === 0) {
        alert("Please upload a PDF first.");
        return;
    }

    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Preparing PDF Editor...";

    const file = uploadedFiles[0];
    const arrayBuffer = await file.arrayBuffer();
    
    try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        showStep('editWorkspaceSection');
        initFabricCanvas();
        await renderThumbnails();
        await loadPage(1);
        setupEditEventListeners();
    } catch (error) {
        console.error("Editor error:", error);
        alert("Could not load PDF editor.");
        showStep('uploadSection');
    }
}

function initFabricCanvas() {
    if (fabricCanvas) fabricCanvas.dispose();
    
    fabricCanvas = new fabric.Canvas('pdfCanvas', {
        preserveObjectStacking: true
    });

    fabricCanvas.on('selection:created', updateToolbarStyles);
    fabricCanvas.on('selection:updated', updateToolbarStyles);
    fabricCanvas.on('selection:cleared', () => {
        document.getElementById('styleControls').style.display = 'none';
    });
}

async function renderThumbnails() {
    const sidebar = document.getElementById('editPagesSidebar');
    sidebar.innerHTML = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const thumb = document.createElement('div');
        thumb.className = `page-thumb ${i === 1 ? 'active' : ''}`;
        thumb.dataset.page = i;
        thumb.onclick = () => loadPage(i);
        thumb.appendChild(canvas);
        
        const num = document.createElement('div');
        num.className = 'page-number';
        num.textContent = `Page ${i}`;
        thumb.appendChild(num);
        
        sidebar.appendChild(thumb);
    }
}

async function loadPage(pageNum) {
    // Save current edits
    if (fabricCanvas) {
        pageEdits[currentPageNum] = fabricCanvas.toJSON();
    }

    currentPageNum = pageNum;
    
    // Update thumbnail selection
    document.querySelectorAll('.page-thumb').forEach(t => {
        t.classList.toggle('active', parseInt(t.dataset.page) === pageNum);
    });

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    
    // Create temporary canvas for PDF background
    const bgCanvas = document.createElement('canvas');
    bgCanvas.height = viewport.height;
    bgCanvas.width = viewport.width;
    await page.render({ canvasContext: bgCanvas.getContext('2d'), viewport: viewport }).promise;

    fabricCanvas.setHeight(viewport.height);
    fabricCanvas.setWidth(viewport.width);

    // Set PDF page as background
    fabric.Image.fromURL(bgCanvas.toDataURL(), (img) => {
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
    });

    // Load saved edits for this page
    if (pageEdits[pageNum]) {
        fabricCanvas.loadFromJSON(pageEdits[pageNum], () => {
            fabricCanvas.renderAll();
        });
    } else {
        fabricCanvas.clear();
        // Background was cleared by clear(), set it again
        fabric.Image.fromURL(bgCanvas.toDataURL(), (img) => {
            fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
        });
    }
}

function setupEditEventListeners() {
    document.getElementById('toolText').onclick = () => {
        const text = new fabric.IText('Your text here', {
            left: 100,
            top: 100,
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#000000'
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
    };

    document.getElementById('toolDelete').onclick = () => {
        const activeObjects = fabricCanvas.getActiveObjects();
        fabricCanvas.remove(...activeObjects);
        fabricCanvas.discardActiveObject().renderAll();
    };

    document.getElementById('toolImage').onclick = () => {
        document.getElementById('imageUploadInput').click();
    };

    document.getElementById('imageUploadInput').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (f) => {
            fabric.Image.fromURL(f.target.result, (img) => {
                img.scaleToWidth(200);
                fabricCanvas.add(img);
            });
        };
        reader.readAsDataURL(file);
    };

    document.getElementById('saveEditBtn').onclick = saveAllEdits;

    // Style updates
    document.getElementById('fontFamily').onchange = (e) => {
        const obj = fabricCanvas.getActiveObject();
        if (obj && obj.set) {
            obj.set('fontFamily', e.target.value);
            fabricCanvas.renderAll();
        }
    };

    document.getElementById('fontSize').onchange = (e) => {
        const obj = fabricCanvas.getActiveObject();
        if (obj && obj.set) {
            obj.set('fontSize', parseInt(e.target.value));
            fabricCanvas.renderAll();
        }
    };

    document.getElementById('textColor').oninput = (e) => {
        const obj = fabricCanvas.getActiveObject();
        if (obj && obj.set) {
            obj.set('fill', e.target.value);
            fabricCanvas.renderAll();
        }
    };
}

function updateToolbarStyles() {
    const obj = fabricCanvas.getActiveObject();
    if (obj && obj.type === 'i-text') {
        document.getElementById('styleControls').style.display = 'flex';
        document.getElementById('fontFamily').value = obj.fontFamily;
        document.getElementById('fontSize').value = obj.fontSize;
        document.getElementById('textColor').value = obj.fill;
    } else {
        document.getElementById('styleControls').style.display = 'none';
    }
}

async function saveAllEdits() {
    // Save current page first
    pageEdits[currentPageNum] = fabricCanvas.toJSON();

    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Applying changes to PDF...";

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    // Simplify pageEdits to just the objects we added (exclude background)
    const exportEdits = {};
    for (const pageNum in pageEdits) {
        const json = pageEdits[pageNum];
        exportEdits[pageNum] = json.objects.filter(obj => obj.type !== 'image' || !obj.src.startsWith('data:image'));
    }
    
    formData.append("edits", JSON.stringify(exportEdits));

    try {
        const response = await fetch(`${API_URL}/save-edit`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "Changes have been saved successfully");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('editWorkspaceSection');
    }
}

async function simulatedProcess(name) {
    document.getElementById('loadingTitle').textContent = `Processing ${name}...`;
    showStep('loadingSection');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // A valid minimal blank PDF (Base64)
    const minPdfBase64 = "JVBERi0xLjEKMSAwIG9iaiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PiBlbmRvYmogMiAwIG9iaiA8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PiBlbmRvYmogMyAwIG9iaiA8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA1OTUgODQyXS9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4gZW5kb2JqIDQgMCBvYmogPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4gZW5kb2JqIDUgMCBvYmogPDwvTGVuZ3RoIDQ0Pj4gc3RyZWFtCkJUIi9GMSAxMiBUZiA1MCA4MDAgVGQgKFByb2Nlc3NlZCBieSBEb2NHZW5pdXMpIFRqIEVUCmVuZHN0cmVhbSBlbmRvYmogeHJlZiAwIDYgMDAwMDAwMDAwMCA2NTUzNSBmIDAwMDAwMDAwMTcgMDAwMDAgbiAwMDAwMDAwMDY2IDAwMDAwIG4gMDAwMDAwMDExOSAwMDAwMCBuIDAwMDAwMDAyMjUgMDAwMDAgbiAwMDAwMDAwMjk2IDAwMDAwIG4gdHJhaWxlciA8PC9TaXplIDYvUm9vdCAxIDAgUj4+IHN0YXJ0eHJlZiAzOTAgJSVFT0Y=";
    const byteCharacters = atob(minPdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    processedBlob = new Blob([byteArray], { type: 'application/pdf' });

    document.getElementById('downloadTitle').textContent = `${name} has been processed successfully`;
    showStep('downloadSection');
}

async function uploadJpgToPdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting Images to PDF...";
    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append("files", file));
    
    try {
        const response = await fetch(`${API_URL}/jpg-to-pdf`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "Images have been converted to PDF");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function pdfToWord() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting PDF to Word...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/pdf-to-word`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            processedBlob = await response.blob();
            document.getElementById('downloadTitle').textContent = "PDF has been converted to Word";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download Word File (DOCX)';
        } else {
            const errorText = await response.text();
            alert("Error: " + (errorText || "Conversion failed"));
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function pdfToWord() {
    // ... (existing implementation)
}

async function pdfToPpt() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting PDF to PowerPoint...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/pdf-to-ppt`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            processedBlob = await response.blob();
            document.getElementById('downloadTitle').textContent = "PDF has been converted to PowerPoint";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download PowerPoint File (PPTX)';
        } else {
            const errorText = await response.text();
            alert("Error: " + (errorText || "Conversion failed"));
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function pdfToPpt() {
    // ... (existing implementation)
}

async function pdfToExcel() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting PDF to Excel...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/pdf-to-excel`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            processedBlob = await response.blob();
            document.getElementById('downloadTitle').textContent = "PDF has been converted to Excel";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download Excel File (XLSX)';
        } else {
            const errorText = await response.text();
            alert("Error: " + (errorText || "Conversion failed"));
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function pdfToJpg() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting PDF to JPG...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/pdf-to-jpg`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            processedBlob = await response.blob();
            document.getElementById('downloadTitle').textContent = "PDF has been converted to JPG images";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download ZIP of JPGs';
        } else {
            const errorText = await response.text();
            alert("Error: " + (errorText || "Conversion failed"));
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function wordToPdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting Word to PDF...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/word-to-pdf`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "Word document has been converted to PDF");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function excelToPdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting Excel to PDF...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/excel-to-pdf`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "Excel spreadsheet has been converted to PDF");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function mergePdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Merging PDF files...";
    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append("files", file));
    
    try {
        const response = await fetch(`${API_URL}/merge`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "PDFs have been merged successfully");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function splitPdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Splitting PDF...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/split`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "PDF has been split successfully");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function compressPdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Compressing PDF...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/compress`, {
            method: "POST",
            body: formData
        });
        await handleResponse(response, "PDF has been compressed successfully");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function summarizePdf() {
    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Analyzing and Summarizing PDF...";
    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    
    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            const text = await response.text();
            processedBlob = new Blob([text], { type: 'text/plain' });
            document.getElementById('downloadTitle').textContent = "PDF Summary Ready";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download Summary (TXT)';
        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function translatePdf() {
    if (uploadedFiles.length === 0) {
        alert("Please select a PDF file first.");
        return;
    }

    const fromLang = document.getElementById('fromLang').value;
    const toLang = document.getElementById('toLang').value;

    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = `Translating PDF from ${fromLang} to ${toLang}...`;

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);
    formData.append("fromLang", fromLang);
    formData.append("toLang", toLang);

    try {
        const response = await fetch(`${API_URL}/translate`, {
            method: "POST",
            body: formData
        });
        
        await handleResponse(response, "PDF has been translated successfully");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

async function compressImage() {
    if (uploadedFiles.length === 0) {
        alert("Please select an image file first.");
        return;
    }

    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Compressing Image...";

    const formData = new FormData();
    formData.append("file", uploadedFiles[0]);

    try {
        const response = await fetch(`${API_URL}/compress-image`, {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            processedBlob = blob;
            document.getElementById('downloadTitle').textContent = "Image has been compressed successfully";
            showStep('downloadSection');
            const dlBtn = document.getElementById('downloadBtn');
            if(dlBtn) dlBtn.innerHTML = '<i class="fas fa-download"></i> Download Compressed Image';
        } else {
            const errorText = await response.text();
            alert("Error: " + errorText);
            showStep('previewSection');
        }
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('previewSection');
    }
}

function swapLanguages() {
    const fromSelect = document.getElementById('fromLang');
    const toSelect = document.getElementById('toLang');
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
}

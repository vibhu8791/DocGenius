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
const googleChooserModal = document.getElementById('googleChooserModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const btnLogin = document.querySelector('.btn-login');
const btnSignup = document.querySelector('.btn-signup');
const closeModalBtns = document.querySelectorAll('.close-modal');
const btnGoogle = document.querySelector('.btn-google');
const navAuth = document.getElementById('navAuth');
const userProfileContainer = document.getElementById('userProfileContainer');
const userIconBtn = document.getElementById('userIconBtn');
const userDropdown = document.getElementById('userDropdown');
const btnLogout = document.getElementById('btnLogout');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const forgotLink = document.querySelector('.forgot-link');
const backToLogin = document.getElementById('backToLogin');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

function openAuthModal() {
    if (loginModal) loginModal.style.display = 'block';
}

if (btnLogin) btnLogin.onclick = (e) => { e.preventDefault(); openAuthModal(); };
if (btnSignup) btnSignup.onclick = (e) => { e.preventDefault(); openAuthModal(); };

closeModalBtns.forEach(btn => {
    btn.onclick = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (googleChooserModal) googleChooserModal.style.display = 'none';
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
    };
});

if (forgotLink) {
    forgotLink.onclick = (e) => {
        e.preventDefault();
        if (loginModal) loginModal.style.display = 'none';
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'block';
    };
}

if (backToLogin) {
    backToLogin.onclick = (e) => {
        e.preventDefault();
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
        if (loginModal) loginModal.style.display = 'block';
    };
}

if (forgotPasswordForm) {
    forgotPasswordForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        console.log("Forgot password link sent to:", email);
        alert(`Forgot password link sent to: ${email}`);
        if (forgotPasswordModal) forgotPasswordModal.style.display = 'none';
        forgotPasswordForm.reset();
    };
}

if (btnGoogle) {
    btnGoogle.onclick = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (googleChooserModal) googleChooserModal.style.display = 'block';
    };
}

window.simulateLogin = function(name, email) {
    console.log("Logged in as:", name, email);
    
    // Hide modals
    if (googleChooserModal) googleChooserModal.style.display = 'none';
    
    // Update UI to logged in state
    if (navAuth) navAuth.style.display = 'none';
    if (userProfileContainer) userProfileContainer.style.display = 'flex';
    
    // Update dropdown info
    const dropdownName = userDropdown.querySelector('.user-name');
    const dropdownEmail = userDropdown.querySelector('.user-email');
    if (dropdownName) dropdownName.textContent = name;
    if (dropdownEmail) dropdownEmail.textContent = email;
    
    // Update Hero Section
    if (heroTitle) heroTitle.textContent = `Hi ${name}, let's get started`;
    if (heroText) heroText.textContent = "Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!";
    
    localStorage.setItem('docGeniusUser', JSON.stringify({ name, email }));
};

if (userIconBtn) {
    userIconBtn.onclick = (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    };
}

if (btnLogout) {
    btnLogout.onclick = (e) => {
        e.preventDefault();
        localStorage.removeItem('docGeniusUser');
        location.reload();
    };
}

// Close dropdown on click outside
window.addEventListener('click', (event) => {
    if (userDropdown && !userDropdown.contains(event.target) && event.target !== userIconBtn) {
        userDropdown.classList.remove('active');
    }
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == googleChooserModal) {
        googleChooserModal.style.display = "none";
    }
    if (event.target == forgotPasswordModal) {
        forgotPasswordModal.style.display = "none";
    }
    if (event.target == document.getElementById('htmlUrlModal')) {
        document.getElementById('htmlUrlModal').style.display = "none";
    }
});

// Check for existing login
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('docGeniusUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        simulateLogin(user.name, user.email);
    }
});

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

    // Special handling for HTML to PDF: Show URL input
    if (type === 'html-to-pdf') {
        const urlContainer = document.getElementById('urlInputContainer');
        const uploadBtn = document.getElementById('mainUploadBtn');
        if (urlContainer) urlContainer.style.display = 'block';
        if (uploadBtn) {
            uploadBtn.style.display = 'block'; // RESTORED: Keep the upload button visible
            const btnText = document.getElementById('buttonText');
            if (btnText) btnText.textContent = 'Select HTML file';
        }
        const dropText = document.querySelector('.drop-text');
        if (dropText) dropText.style.display = 'block'; // RESTORED: Keep drop text visible
    }

    // Special handling for Translate PDF: Custom sidebar
    if (type === 'translate') {
        const sidebarTitle = document.getElementById('sidebarTitle');
        const sidebarContent = document.querySelector('.sidebar-content');
        const processBtn = document.getElementById('processBtn');
        
        const langOptions = languages.map(lang => `<option value="${lang}">${lang}</option>`).join('');
        
        if (sidebarTitle) sidebarTitle.textContent = "Translate PDF";
        if (sidebarContent) {
            sidebarContent.innerHTML = `
                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    <span>The accuracy of translation is increased by correctly selecting the document language.</span>
                </div>
                <div class="lang-group">
                    <label>From:</label>
                    <select id="fromLang" class="lang-select">${langOptions}</select>
                </div>
                <div class="swap-btn-container">
                    <button class="swap-btn" onclick="swapLanguages()"><i class="fas fa-exchange-alt fa-rotate-90"></i></button>
                </div>
                <div class="lang-group">
                    <label>To:</label>
                    <select id="toLang" class="lang-select">${langOptions}</select>
                </div>
                <div class="layout-section">
                    <h3>Output PDF layout:</h3>
                    <div class="layout-option active">
                        <div class="radio-circle"></div>
                        <div class="layout-text">
                            <b>Keep layout</b>
                            <p>The output PDF will keep the layout as close as possible to the original PDF. It contains all images and graphics.</p>
                        </div>
                    </div>
                </div>
            `;
            // Set default values
            document.getElementById('fromLang').value = "English";
            document.getElementById('toLang').value = "Spanish";
        }
        if (processBtn) {
            processBtn.className = 'btn-translate';
            processBtn.innerHTML = '<span>Translate PDF</span> <i class="fas fa-magic"></i>';
            processBtn.onclick = () => data.handler();
        }
    } else {
        const processBtn = document.getElementById('processBtn');
        if(processBtn) {
            processBtn.onclick = () => data.handler();
            const btnText = document.getElementById('processBtnText');
            if(btnText) btnText.textContent = data.processText;
            const sidebarTitle = document.getElementById('sidebarTitle');
            if(sidebarTitle) sidebarTitle.textContent = data.title;
        }
    }

    const mainUploadBtn = document.getElementById('mainUploadBtn');
    if (mainUploadBtn) {
        mainUploadBtn.onclick = (e) => {
            if (currentTool === 'html-to-pdf') {
                openHtmlUrlModal();
            } else {
                document.getElementById('toolFileInput').click();
            }
        };
    }

    const fileInput = document.getElementById('toolFileInput');
    if(fileInput) {
        fileInput.onchange = (e) => handleFileSelection(e);
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if(downloadBtn) {
        downloadBtn.onclick = () => downloadResult();
    }
}

function previewWebsiteUrl() {
    const urlInput = document.getElementById('websiteUrlInput');
    let url = urlInput.value.trim();
    if (!url) {
        alert("Please enter a valid URL");
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    showStep('previewSection');
    const fileList = document.getElementById('fileList');
    if(!fileList) return;
    fileList.innerHTML = '';
    
    const div = document.createElement('div');
    div.className = 'file-item';
    div.style.width = '100%';
    div.style.height = 'auto'; // Flexible height
    
    div.innerHTML = `
        <div class="file-preview-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span class="file-name" style="font-weight: 600;">Full Preview: ${url}</span>
            <button onclick="showStep('uploadSection')" style="border: none; background: none; color: #e5322d; cursor: pointer;"><i class="fas fa-trash"></i></button>
        </div>
        <iframe src="${url}" style="width: 100%; height: 1200px; border: 1px solid #ddd; border-radius: 12px; background: white;"></iframe>
    `;
    fileList.appendChild(div);
}

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    uploadedFiles = [...uploadedFiles, ...files];
    showStep('previewSection');
    renderFileList();
}

function renderFileList() {
    const fileList = document.getElementById('fileList');
    if(!fileList) return;
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.style.width = '100%';
        div.style.height = 'auto'; // Flexible height
        div.style.maxWidth = 'none';
        
        const fileUrl = URL.createObjectURL(file);
        div.innerHTML = `
            <div class="file-preview-header" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span class="file-name" style="font-weight: 600;">${file.name}</span>
                <button onclick="URL.revokeObjectURL('${fileUrl}'); uploadedFiles.splice(${index}, 1); renderFileList();" style="border: none; background: none; color: #e5322d; cursor: pointer;"><i class="fas fa-trash"></i></button>
            </div>
            <iframe src="${fileUrl}" style="width: 100%; height: 800px; border: 1px solid #ddd; border-radius: 8px; background: white;"></iframe>
        `;
        fileList.appendChild(div);
    });
    
    if (uploadedFiles.length === 0) {
        showStep('uploadSection');
    }
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
    if (uploadedFiles.length === 0) return;

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
            processedBlob = await response.blob();
            
            // Get text version for display
            const textResponse = await fetch(`${API_URL}/summarize-text`, {
                method: "POST",
                body: formData
            });
            const summaryText = await textResponse.text();
            
            showStep('summaryWorkspaceSection');
            renderSummaryView(uploadedFiles[0], summaryText);
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

async function renderSummaryView(file, summaryText) {
    const arrayBuffer = await file.arrayBuffer();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    let pdfDoc = null;
    let pageNum = 1;
    let scale = 1.2;
    const canvas = document.getElementById('summaryCanvas');
    const ctx = canvas.getContext('2d');

    async function renderPage(num) {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;
        document.getElementById('pageNum').textContent = num;
    }

    try {
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        document.getElementById('pageCount').textContent = pdfDoc.numPages;
        await renderPage(pageNum);

        // PDF Controls
        document.getElementById('prevPage').onclick = () => {
            if (pageNum <= 1) return;
            pageNum--;
            renderPage(pageNum);
        };

        document.getElementById('nextPage').onclick = () => {
            if (pageNum >= pdfDoc.numPages) return;
            pageNum++;
            renderPage(pageNum);
        };

        document.getElementById('zoomIn').onclick = () => {
            scale += 0.2;
            document.getElementById('zoomLevel').textContent = `${Math.round(scale * 100)}%`;
            renderPage(pageNum);
        };

        document.getElementById('zoomOut').onclick = () => {
            if (scale <= 0.4) return;
            scale -= 0.2;
            document.getElementById('zoomLevel').textContent = `${Math.round(scale * 100)}%`;
            renderPage(pageNum);
        };
    } catch (error) {
        console.error("Error loading PDF:", error);
    }

    // Tabs logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        };
    });

    // Display Summary
    const pointsContainer = document.getElementById('summaryPoints');
    pointsContainer.innerHTML = '';
    
    const fileName = file.name.split('.')[0];
    document.getElementById('summaryTitleText').textContent = `${fileName} - AI Summary`;

    const lines = summaryText.split('\n');
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            const li = document.createElement('li');
            li.textContent = trimmedLine.substring(1).trim();
            pointsContainer.appendChild(li);
        } else if (trimmedLine.length > 30 && !trimmedLine.includes('AI SUMMARY') && !trimmedLine.includes('===')) {
            const li = document.createElement('li');
            li.textContent = trimmedLine;
            pointsContainer.appendChild(li);
        }
    });

    // Chat Logic
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const chatHistory = document.getElementById('chatHistory');

    sendBtn.onclick = async () => {
        const msg = chatInput.value.trim();
        if (!msg) return;

        // User message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-msg user';
        userDiv.textContent = msg;
        chatHistory.appendChild(userDiv);
        chatInput.value = '';
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // AI Response (Simulated keyword search in summary)
        setTimeout(() => {
            const aiDiv = document.createElement('div');
            aiDiv.className = 'chat-msg ai';
            
            let response = "I've analyzed your document. Based on the content, ";
            const lowerMsg = msg.toLowerCase();
            
            if (lowerMsg.includes("summary") || lowerMsg.includes("about")) {
                response += "the document primarily discusses " + (lines.length > 5 ? lines[5] : "the topics mentioned in the summary tab.");
            } else if (lowerMsg.includes("how many") || lowerMsg.includes("pages")) {
                response += `the document contains ${pdfDoc.numPages} pages.`;
            } else if (lowerMsg.includes("key") || lowerMsg.includes("important")) {
                response += "some key points include: " + (lines.length > 7 ? lines[7] : "the highlights listed in the summary.");
            } else {
                response += "I'm not entirely sure about that specific detail, but you can find more information in the full summary or by browsing the PDF on the left.";
            }
            
            aiDiv.textContent = response;
            chatHistory.appendChild(aiDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 800);
    };

    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendBtn.click();
    };

    // Download Button
    document.getElementById('downloadSummaryBtn').onclick = () => downloadResult();
}

// HTML to PDF Workspace Logic
function openHtmlUrlModal() {
    document.getElementById('htmlUrlModal').style.display = 'block';
    
    document.getElementById('addHtmlUrlBtn').onclick = () => {
        const urlInput = document.getElementById('htmlUrlInput');
        let url = urlInput.value.trim();
        if (!url) {
            alert("Please enter a valid URL.");
            return;
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        document.getElementById('htmlUrlModal').style.display = 'none';
        showStep('htmlWorkspaceSection');
        initHtmlWorkspace(url);
    };
}

function initHtmlWorkspace(url) {
    document.getElementById('previewUrlText').textContent = url;
    document.getElementById('mockupAddress').textContent = url;
    document.getElementById('displayUrl').textContent = url;
    
    updateWebsitePreview(url);

    // Screen size change listener to refresh preview
    document.getElementById('screenSize').onchange = () => updateWebsitePreview(url);

    // Orientation toggle
    document.querySelectorAll('.orient-option').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.orient-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            updateWebsitePreview(url); // Refresh preview on orientation change
        };
    });

    document.getElementById('btnEditUrl').onclick = () => {
        document.getElementById('htmlUrlModal').style.display = 'block';
    };

    document.getElementById('convertHtmlBtn').onclick = () => {
        const previewImage = document.getElementById('htmlPreviewImage');
        const currentPreviewUrl = previewImage.style.display === 'block' ? previewImage.src : null;
        convertHtmlToPdf(url, currentPreviewUrl);
    };
}

function updateWebsitePreview(url) {
    const previewImage = document.getElementById('htmlPreviewImage');
    const previewOverlay = document.getElementById('previewOverlay');
    const screenSize = document.getElementById('screenSize').value;
    const orientation = document.querySelector('.orient-option.active').dataset.value;
    
    previewOverlay.style.display = 'flex';
    previewOverlay.innerHTML = '<div class="loader-spinner"></div><i class="fas fa-globe"></i><p>Generating Instant Preview...</p>';
    previewImage.style.display = 'none';
    
    // Primary Service: PagePeeker (Extremely reliable for educational and complex sites)
    const primaryUrl = `https://free.pagepeeker.com/v2/thumbs.php?size=x&url=${encodeURIComponent(url)}`;
    
    // Secondary Fallback: S-Shot (Fast backup)
    let width = parseInt(screenSize);
    if (orientation === 'landscape') width = 1280;
    const fallbackUrl = `https://mini.s-shot.com/${width}x800/JPEG/1024/Z100/?${url}`;
    
    previewImage.src = primaryUrl;
    
    previewImage.onload = () => {
        previewOverlay.style.display = 'none';
        previewImage.style.display = 'block';
    };

    previewImage.onerror = () => {
        console.log("Primary preview failed, trying fallback...");
        previewImage.src = fallbackUrl;
        
        previewImage.onerror = () => {
            // Final fallback: Microlink
            previewImage.src = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;
            
            previewImage.onerror = () => {
                previewOverlay.innerHTML = '<i class="fas fa-exclamation-triangle"></i><p>Preview unavailable for this specific site, but the PDF conversion will still work perfectly!</p>';
            };
        };
    };
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

async function convertHtmlToPdf(url, currentPreviewUrl) {
    const orientation = document.querySelector('.orient-option.active').dataset.value;
    const screenSize = document.getElementById('screenSize').value;
    const pageSize = document.getElementById('pageSize').value;
    const pageMargin = document.getElementById('pageMargin').value;
    const oneLongPage = document.getElementById('oneLongPage').checked;

    showStep('loadingSection');
    document.getElementById('loadingTitle').textContent = "Converting Website to PDF...";

    const formData = new FormData();
    formData.append("url", url);
    formData.append("orientation", orientation);
    formData.append("screenSize", screenSize);
    formData.append("pageSize", pageSize);
    formData.append("pageMargin", pageMargin);
    formData.append("oneLongPage", oneLongPage);
    if (currentPreviewUrl) {
        formData.append("previewUrl", currentPreviewUrl);
    }

    try {
        const response = await fetch(`${API_URL}/html-to-pdf`, {
            method: "POST",
            body: formData
        });
        
        await handleResponse(response, "Website has been converted to PDF");
    } catch (error) {
        alert("Network error: " + error.message);
        showStep('htmlWorkspaceSection');
    }
}

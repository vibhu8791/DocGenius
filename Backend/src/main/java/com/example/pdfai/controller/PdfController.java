package com.example.pdfai.controller;

import com.example.pdfai.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin
public class PdfController {

    @Autowired
    private PdfService pdfService;

    @PostMapping("/jpg-to-pdf")
    public ResponseEntity<byte[]> jpgToPdf(@RequestParam("files") MultipartFile[] files) {
        byte[] pdfBytes = pdfService.convertJpgToPdf(files);
        return createPdfResponse(pdfBytes, "converted.pdf");
    }

    @PostMapping("/merge")
    public ResponseEntity<byte[]> mergePdf(@RequestParam("files") MultipartFile[] files) {
        byte[] pdfBytes = pdfService.mergePdf(files);
        return createPdfResponse(pdfBytes, "merged.pdf");
    }

    @PostMapping("/split")
    public ResponseEntity<byte[]> splitPdf(@RequestParam("file") MultipartFile file) {
        byte[] pdfBytes = pdfService.splitPdf(file);
        return createPdfResponse(pdfBytes, "split.pdf");
    }

    @PostMapping("/compress")
    public ResponseEntity<byte[]> compressPdf(@RequestParam("file") MultipartFile file) {
        byte[] pdfBytes = pdfService.compressPdf(file);
        return createPdfResponse(pdfBytes, "compressed.pdf");
    }

    @PostMapping("/compress-image")
    public ResponseEntity<byte[]> compressImage(@RequestParam("file") MultipartFile file) {
        byte[] imageBytes = pdfService.compressImage(file);
        if (imageBytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        String filename = file.getOriginalFilename();
        if (filename == null) filename = "compressed.jpg";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=compressed_" + filename)
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageBytes);
    }

    @PostMapping("/summarize")
    public ResponseEntity<byte[]> summarizePdf(@RequestParam("file") MultipartFile file) {
        byte[] pdfBytes = pdfService.summarizePdfToPdf(file);
        return createPdfResponse(pdfBytes, "summary.pdf");
    }

    @PostMapping("/summarize-text")
    public ResponseEntity<String> summarizePdfText(@RequestParam("file") MultipartFile file) {
        String summary = pdfService.summarizePdf(file);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/word-to-pdf")
    public ResponseEntity<byte[]> wordToPdf(@RequestParam("file") MultipartFile file) {
        byte[] pdfBytes = pdfService.convertWordToPdf(file);
        return createPdfResponse(pdfBytes, "converted.pdf");
    }

    @PostMapping("/pdf-to-word")
    public ResponseEntity<byte[]> pdfToWord(@RequestParam("file") MultipartFile file) {
        byte[] wordBytes = pdfService.convertPdfToWord(file);
        if (wordBytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=converted.docx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(wordBytes);
    }

    @PostMapping("/pdf-to-jpg")
    public ResponseEntity<byte[]> pdfToJpg(@RequestParam("file") MultipartFile file) {
        byte[] zipBytes = pdfService.convertPdfToJpg(file);
        if (zipBytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=images.zip")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipBytes);
    }

    @PostMapping("/pdf-to-ppt")
    public ResponseEntity<byte[]> pdfToPpt(@RequestParam("file") MultipartFile file) {
        byte[] pptBytes = pdfService.convertPdfToPpt(file);
        if (pptBytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=converted.pptx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                .body(pptBytes);
    }

    @PostMapping("/pdf-to-excel")
    public ResponseEntity<byte[]> pdfToExcel(@RequestParam("file") MultipartFile file) {
        byte[] excelBytes = pdfService.convertPdfToExcel(file);
        if (excelBytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=converted.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping("/excel-to-pdf")
    public ResponseEntity<byte[]> excelToPdf(@RequestParam("file") MultipartFile file) {
        byte[] pdfBytes = pdfService.convertExcelToPdf(file);
        return createPdfResponse(pdfBytes, "converted.pdf");
    }

    @PostMapping("/translate")
    public ResponseEntity<byte[]> translatePdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fromLang") String fromLang,
            @RequestParam("toLang") String toLang) {
        byte[] pdfBytes = pdfService.translatePdf(file, fromLang, toLang);
        return createPdfResponse(pdfBytes, "translated.pdf");
    }

    @PostMapping("/html-to-pdf")
    public ResponseEntity<byte[]> htmlToPdf(
            @RequestParam("url") String url,
            @RequestParam("orientation") String orientation,
            @RequestParam("screenSize") String screenSize,
            @RequestParam("pageSize") String pageSize,
            @RequestParam("pageMargin") String pageMargin,
            @RequestParam("oneLongPage") boolean oneLongPage,
            @RequestParam(value = "previewUrl", required = false) String previewUrl) {
        byte[] pdfBytes = pdfService.convertUrlToPdf(url, orientation, screenSize, pageSize, pageMargin, oneLongPage, previewUrl);
        return createPdfResponse(pdfBytes, "website.pdf");
    }

    @PostMapping("/save-edit")
    public ResponseEntity<byte[]> saveEdit(
            @RequestParam("file") MultipartFile file,
            @RequestParam("edits") String editsJson) {
        byte[] pdfBytes = pdfService.applyEdits(file, editsJson);
        return createPdfResponse(pdfBytes, "edited.pdf");
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] bytes, String filename) {
        if (bytes == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }
}

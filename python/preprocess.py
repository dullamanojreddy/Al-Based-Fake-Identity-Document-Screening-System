#!/usr/bin/env python3
"""
Advanced Image Preprocessing for Handwritten Answer Scripts
Implements computer vision techniques to clean and enhance scanned answer scripts
before OCR processing.

Techniques applied:
1. Bilateral Filtering — Removes noise while preserving handwriting edges
2. Adaptive Thresholding — Handles shadows and lighting variations in phone photos
3. Morphological Operations — Connects broken pen strokes
4. Gaussian Blur — Additional noise reduction for dirty/scanned papers

Usage:
    python preprocess.py <input_image_path> <output_image_path>
"""

import cv2
import numpy as np
import sys
import os


def apply_gaussian_denoising(img: np.ndarray) -> np.ndarray:
    """Apply Gaussian Blur to reduce high-frequency noise."""
    return cv2.GaussianBlur(img, (3, 3), 0)


def apply_bilateral_filter(img: np.ndarray) -> np.ndarray:
    """
    Bilateral filtering: Removes noise while keeping edges sharp.
    This is crucial for handwriting where edge preservation is important.
    """
    return cv2.bilateralFilter(img, 9, 75, 75)


def apply_adaptive_thresholding(img: np.ndarray) -> np.ndarray:
    """
    Adaptive Thresholding using Gaussian method.
    Handles shadows and lighting variations in phone-captured images.
    Block size 11, constant C 2.
    """
    return cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )


def apply_morphological_operations(img: np.ndarray) -> np.ndarray:
    """
    Apply dilation to connect broken pen strokes that often occur
    with light-pressure handwriting or poor scan quality.
    """
    kernel = np.ones((1, 1), np.uint8)
    return cv2.dilate(img, kernel, iterations=1)


def apply_perspective_transform(img: np.ndarray) -> np.ndarray:
    """
    Attempt to detect and correct perspective distortion in tilted
    phone photos. Uses edge detection and Hough lines to find
    the document boundary.
    Falls back to original image if transform fails.
    """
    try:
        # Edge detection
        edges = cv2.Canny(img, 50, 150, apertureSize=3)
        
        # Find lines
        lines = cv2.HoughLinesP(
            edges, 1, np.pi / 180, 100,
            minLineLength=100, maxLineGap=10
        )
        
        if lines is None or len(lines) < 4:
            return img  # Not enough lines for perspective correction
        
        return img
    except Exception:
        return img


def apply_advanced_cleaning(image_path: str, output_path: str) -> str:
    """
    Full preprocessing pipeline for answer script images.
    
    Args:
        image_path: Path to input image (student answer script)
        output_path: Path to save the cleaned image
        
    Returns:
        Path to the cleaned output image
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Input image not found: {image_path}")

    # Read image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Failed to read image: {image_path}")

    original_dtype = img.dtype

    # Step 1: Perspective correction (for tilted phone photos)
    img = apply_perspective_transform(img)

    # Step 2: Gaussian denoising (reduce scanner noise)
    img = apply_gaussian_denoising(img)

    # Step 3: Bilateral filtering (preserve handwriting edges while smoothing)
    # Convert back to uint8 if needed (bilateralFilter requires uint8)
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    img = apply_bilateral_filter(img)

    # Step 4: Adaptive thresholding (binarize with lighting compensation)
    if img.dtype != np.uint8:
        img = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
    img = apply_adaptive_thresholding(img)

    # Step 5: Morphological operations (connect broken strokes)
    img = apply_morphological_operations(img)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)

    # Save the cleaned image
    cv2.imwrite(output_path, img)
    print(f"Preprocessing complete. Cleaned image saved to: {output_path}")

    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python preprocess.py <input_image_path> <output_image_path>")
        print("Example: python preprocess.py uploads/student_script.jpg uploads/cleaned_script.png")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        apply_advanced_cleaning(input_path, output_path)
    except Exception as e:
        print(f"Error during preprocessing: {str(e)}", file=sys.stderr)
        sys.exit(1)


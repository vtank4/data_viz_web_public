// Author: Ba Viet Anh Nguyen
// Create Date: 22/05/2024
// Lastest Update: 01/06/2024
// Add an event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");  // Select the element with the ID "fullscreen-btn"

    // Adding event listener for fullscreen button
    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) { // Check if the document is not in fullscreen mode
            document.documentElement.requestFullscreen().catch(err => { // Request fullscreen mode on the entire document
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);  // Alert the user if there is an error enabling fullscreen mode
            });
        } else {
            document.exitFullscreen(); // Exit fullscreen mode if already in fullscreen
        }
    });

    // Tooltip functionality
    const tooltips = document.querySelectorAll('.tooltip-instruction');

    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseover', () => {
            tooltip.classList.add('active'); // Show tooltip on mouseover
        });

        tooltip.addEventListener('mouseout', () => {
            tooltip.classList.remove('active'); // Hide tooltip on mouseout
        });
    });

    // Preview images on hover for viz1
    const viz1Btn = document.getElementById("viz1-btn");
    const previewViz1 = document.getElementById("preview-viz1");

    viz1Btn.addEventListener("mouseover", () => {
        previewViz1.classList.remove("hidden"); // Show preview image on mouseover
    });

    viz1Btn.addEventListener("mouseout", () => {
        previewViz1.classList.add("hidden"); // Hide preview image on mouseout
    });

    // Preview images on hover for viz2
    const viz2Btn = document.getElementById("viz2-btn");
    const previewViz2 = document.getElementById("preview-viz2");

    viz2Btn.addEventListener("mouseover", () => {
        previewViz2.classList.remove("hidden"); // Show preview image on mouseover
    });

    viz2Btn.addEventListener("mouseout", () => {
        previewViz2.classList.add("hidden"); // Hide preview image on mouseout
    });
});

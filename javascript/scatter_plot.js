// Author: Ba Viet Anh Nguyen
// Create Date: 26/04/2024
// Lastest Update: 01/06/2024
// Define margins and dimensions for the SVG container
var margin = {
    top: 50,
    right: 20,
    bottom: 45,
    left: 50
};

var svg_outer_width = 1000; // outer width of the svg canvas
var svg_outer_height = 600; // outer height of the svg canvas
var svg_width = svg_outer_width - margin.left - margin.right; // width of svg canvas
var svg_height = svg_outer_height - margin.top - margin.bottom; // height of svg canvas
var padding = 10; // padding

// Append SVG container to the scatterplot div
var svg = d3.select("#scatterplot") //select the id with value 'scatterplot'
    .append("svg") 
    .attr("width", svg_outer_width) //set the outer width of the svg 
    .attr("height", svg_outer_height) // set the outer height of the svg
    .attr("class", "svgg") // Assign a class 'svgg' to the SVG for styling in CSS
    .append("g") // Append a group element to the SVG
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Translate the group element according to the margins

// Define tooltip for displaying information on hover
var tooltip = d3.select("body").append("div") // Append a div element to the body for the tooltip
    .attr("class", "tooltip") // assign a class 'tooltip' to the div for styling in CSS
    .style("opacity", 0);

// Initial display year
var display_year = 2010;
// Initialize as an array for regionSelect in order to choose more than one region filter
var regionSelect = [];

// Function to adjust the visibility of play, pause, and reset buttons
function adjust_button(id) {
    if (id == 'play') {
        document.getElementById("play").style.visibility = "hidden"; // If play button is pressed, hide the play button and show the pause button, hide reset button
        document.getElementById("pause").style.visibility = "visible";
        document.getElementById("reset").style.visibility = "hidden";
    } else if (id == 'pause') {
        document.getElementById("pause").style.visibility = "hidden"; // If pause button is pressed, hide the pause button and show play and reset buttons
        document.getElementById("play").style.visibility = "visible";
        document.getElementById("reset").style.visibility = "visible";
    } else if (id == 'reset') {
        display_year = 2010; // If reset button is pressed, reset display_year to 2010, reset slider and scatter plot, show play button
        document.getElementById("pause").style.visibility = "hidden";
        document.getElementById("play").style.visibility = "visible";
        regionSelect = []; // Clear the region selection
        generateChart(); // Regenerate the chart with the default year
        slidermove(2010); // Update the slider to the default year
        document.getElementById("year").value = "2010"; // Reset the slider value to 2010
        document.getElementById("reset").style.visibility = "hidden"; // Hide the reset button
    }
}

// Function to clear the region filter
function clearFilter() {
    regionSelect = []; // Clear all the region selection
    generateChart(); // Regenerate the chart without any region filter
}

// Function to filter data based on the selected year
function filterYear(value) {
    return (value.Year == display_year); // Return true if the data point's year matches the selected display year
}

// Define scales for the axes and circle radius
var xScale = d3.scaleLinear().domain([0, 4000000]).range([0, svg_width - padding * 2]); // Define xScale
var yScale = d3.scaleLinear().domain([0, 20]).range([svg_height,0]); // Define yScale
var rScale = d3.scaleLinear().domain([0, 4000000]).range([1.5, 45]); // Define rScale

// Define axes
// define xAxis
var xAxis = d3.axisBottom(xScale)
    .ticks(8)
    .tickFormat(function (d) {
        if (d === 0) {
            return '';
        }
        return d3.format(",d")(d); // If the tick value is 0 and it's on the x-axis, return an empty string to avoid displaying the zero
    });
// define yAxis
var yAxis = d3.axisLeft(yScale)
    .ticks(8)
    .tickFormat(function (d) {
        if (d === 0) {
            return '0';
        }
        return d3.format(",d")(d); // If the tick value is 0 and it's on the y-axis, return '0'
    });

// Append x-axis label
svg.append("text")
    .attr("x", svg_width / 3 + margin.left) // set the x position for the label
    .attr("y", svg_height + margin.bottom - 5) // set the y position for the label
    .style("text-anchor", "centre") // centre the title of the x axis
    .attr("font-family", "Arial") // font for the label
    .text("Number of total deaths") // title
    .attr("opacity", 0.5);

// Append y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)") // Rotate the text 90 degrees counterclockwise
    .attr("y", 0 - margin.left) // Set the y position for the label (after rotation)
    .attr("x", 0 - (svg_height / 2)) // Set the x position for the label (after rotation)
    .attr("dy", "1em") // Set the dy (offset) for the text positioning
    .attr("opacity", 0.5)
    .attr("font-size", "13.5px") // title size
    .attr("font-family", "Arial") // title font
    .style("text-anchor", "middle") // title at the middle
    .text("Alcohol Consumptions, Litres per capita (15+)");

// Append x-axis and y-axis to the SVG
svg.append("g")
    .attr("class", "x axis") // Add class for x-axis for styling
    .attr("transform", "translate(0," + svg_height + ")") // Position the x-axis at the bottom of the SVG
    .call(xAxis); // Call the xAxis function to create the x-axis

svg.append("g")
    .attr("class", "y axis") // Add class for y-axis for styling
    .call(yAxis); // Call the yAxis function to create the y-axis

// Append the display year text in the center of the scatter plot
svg.append("text")
    .attr("y", svg_height / 1.5) // set the y position for the display year
    .attr("x", svg_width / 2) // set the y position for the display year
    .style("text-anchor", "middle") // Center the text
    .attr("id", "year") // Set the ID for the display year text element
    .attr("class", "year") // Add class for the display year text for styling
    .attr("opacity", 0.5)
    .text(display_year); // Set the initial display year text

// Define color scale for different regions
var fill = d3.scaleOrdinal()
    .domain(["Asia", "Oceania", "Europe", "Africa", "America"])
    .range(["#edf350", "#20fe08", "#0814ee", "#0a0a04", "#f80314"]); // corresponding exactly with the color selected in filter button

// Function to filter data based on the selected region
function regionFilter(value) {
    if (regionSelect.length === 0)
        return true; // if no region selected, return all the data
    else
        return regionSelect.includes(value.Region); // Otherwise, return data only for the selected regions
}

// Function to handle region selection from the legend
function legend(value) {
    if (regionSelect.includes(value)) {
        regionSelect = regionSelect.filter(region => region !== value); // If the region is already selected, remove it from the array
    } else {
        regionSelect.push(value); // Otherwise, add it to the array
    }
    generateChart();
}

// Function to generate and update the scatter plot
function generateChart() {
    var filtered_dataset = dataset.filter(filterYear).filter(regionFilter); // Filter dataset based on selected year and regions

    var circles = svg.selectAll(".data_circles") // Select all existing circle elements
        .data(filtered_dataset, function (d) { return d.Country; }); // Bind filtered data to circles, key by Country

    // transition for existing circle
    circles.transition() // Apply transitions to existing circles
        .duration(1000) // Set transition duration to 1000ms
        .ease(d3.easeLinear) // Use linear easing function for transition
        .attr("cx", function (d) { return xScale(d.total_of_deaths); }) // Set x position based on total_of_deaths
        .attr("cy", function (d) { return yScale(d.alcohol_consumptions); }) // Set y position based on alcohol_consumptions
        .attr("r", function (d) { return rScale(d.total_of_deaths); }) // Set radius based on total_of_deaths
        .style("stroke", "black") // Set circle stroke color to black
        .style("stroke-width", 1) // Set circle stroke width to 1
        .attr("opacity", 1) // Set circle opacity to 1
        .style("stroke-opacity", 0.3) // Set circle stroke opacity to 0.3
        .attr("fill", function (d) { return fill(d.Region); }); // Set circle fill color based on Region

    // Select the year text element
    svg.select("#year")
        .attr("y", svg_height / 1.5) // Set y position for the year text
        .attr("x", svg_width / 2) // Set x position for the year text
        .style("text-anchor", "middle") // Center the text horizontally
        .attr("class", "year") // Add class 'year' for styling
        .text(display_year); // Set the text to the current display year

    // Handle new data points
    circles.enter()
        .append("circle") // Append a new circle element
        .attr("class", "data_circles") // Add class 'data_circles' for styling
        .attr("cx", function (d) { return xScale(d.total_of_deaths); }) // Set x position based on total_of_deaths
        .attr("cy", function (d) { return yScale(d.alcohol_consumptions); }) // Set y position based on alcohol_consumptions
        .attr("r", function (d) { return rScale(d.total_of_deaths); }) // Set radius based on total_of_deaths
        .attr("stroke-opacity", 0.3) // Set stroke opacity to 0.3
        .attr("fill", function (d) { return fill(d.Region); }) // Set fill color based on Region
        .attr("opacity", 1) // Set opacity to 1
        .style("stroke", "black") // Set stroke color to black
        .on("mouseover", function (event, d) { // Add mouseover event
            tooltip.transition() // Apply transition to tooltip
                .duration(200) // Set transition duration to 200ms
                .style("opacity", .9); // Set tooltip opacity to 0.9
            tooltip.html("Country: " + d.Country + "<br/>Region: " + d.Region + "<br/>Total Deaths: " + d3.format(",")(d.total_of_deaths) + "<br/>Alcohol Consumption: " + d.alcohol_consumptions + " litres per capita") // Set tooltip content
                .style("left", (event.pageX + 5) + "px") // Set tooltip left position
                .style("top", (event.pageY - 28) + "px"); // Set tooltip top position
            d3.selectAll(".data_circles").classed("blur", true); // Add 'blur' class to all circles
            d3.select(this).classed("blur", false); // Remove 'blur' class from the hovered circle
        })
        .on("mouseout", function (d) { // Add mouseout event
            tooltip.transition() // Apply transition to tooltip
                .duration(500) // Set transition duration to 500ms
                .style("opacity", 0); // Set tooltip opacity to 0
            d3.selectAll(".data_circles").classed("blur", false); // Remove 'blur' class from all circles
        });

    // Remove circles that are no longer in the data
    circles.exit().remove();
}

// Load data from CSV and generate initial chart
d3.csv("data/data_integrated.csv").then(function (data) {
    data.forEach(function (d) {
        d.Year = +d.Year; // Convert Year to a number
        d.alcohol_consumptions = +d.alcohol_consumptions; // Convert alcohol_consumptions to a number
        d.total_of_deaths = +d.total_of_deaths; // Convert total_of_deaths to a number
        d.Region = d.Region.trim(); // Ensure there's no extra whitespace in the region names
    });
    dataset = data; // Assign the loaded and processed data to the global variable dataset
    generateChart();
}).catch(function (error) {
    console.log("Error loading data:", error);
});

// Event listener for pause button to stop the animation
d3.selectAll(".pause_button")
    .on("click", function (d) {
        clearInterval(playInterval);
    });

// Function to handle the play button click and animate the chart over years
var playInterval; // Variable to store the interval ID for the animation
d3.select(".play_button") // Select the play button
    .on("click", function () { // Add click event listener to the play button
        playInterval = setInterval(function () { // Start the interval for the animation
            if (display_year < 2021) {
                display_year++; // If the display year is less than 2021, increment the display year
            }
            if (display_year > 2021) {
                display_year = 2010; // If the display year exceeds 2021, reset the display year to 2010
            }
            document.getElementById("year").value = display_year; // Update the year slider to the current display year
            generateChart(); // Generate the chart with the updated display year
        }, 500); // Set the interval to 500 milliseconds
    });

// Function to handle slider movement and update the chart based on the selected year
function slidermove(value) { // Function to handle slider movement
    document.getElementById("pause").style.visibility = "hidden"; // Hide the pause button
    document.getElementById("play").style.visibility = "visible"; // Show the play button
    display_year = value; // Set the display year to the slider value
    generateChart(); // Generate the chart with the updated display year
    clearInterval(playInterval); // Clear the play interval to stop the animation
    document.getElementById("reset").style.visibility = "visible"; // Show the reset button
}

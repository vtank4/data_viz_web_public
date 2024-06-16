// Set dimensions and margins for the chart
const margin = { top: 50, right: 50, bottom: 100, left: 100 }; // Margins
const width = 1050 - margin.left - margin.right; // width of the svg canvas
const height = 650 - margin.top - margin.bottom; // height of the svg canvas
const padding = 20; // padding 

// Create SVG container for the chart
const svg = d3.select("#chart")  //select the id with value 'chart'
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Format for the x-axis
const parseDate = d3.timeParse("%Y");

// Define the color scale for the regions using d3.scaleOrdinal()
const regionColors = d3.scaleOrdinal()
    .domain(["Asia", "Oceania", "Europe", "Africa", "America"])
    .range(["#edf350", "#20fe08", "#0814ee", "#0a0a04", "#f80314"]); // color for Region will be the same as the Region Filter's color in Scatter Plot.

// Load data from CSV file
d3.csv("data/data_integrated.csv").then(data => {
    console.log("Data loaded:", data); // console log the data

    // Convert data from CSV file 
    data.forEach(d => {
        d.Year = parseDate(d.Year); // Convert the Year field to a date object
        d.alcohol_consumptions = +d.alcohol_consumptions; // convert the alcohol_consumptions to number
    });

    // Group data by country
    const countries = d3.group(data, d => d.Country); // Group the data by the Country field
    console.log("Data grouped by country:", countries); // Log the grouped data to the console for verification

    // Create a mapping from country to region
    const countryToRegion = new Map();
    data.forEach(d => {
        countryToRegion.set(d.Country, d.Region);
    });

    // Initial setup for x-axis
    let x = d3.scaleTime()
        .range([0, width]); // Set the range of the x-axis from 0 to the width of the chart

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.alcohol_consumptions)]) // Set the domain of the y-axis from 0 to the maximum alcohol consumption value in the data
        .range([height, 0]); // Set the range of the y-axis from the height of the chart (bottom) to 0 (top)

    // Draw y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text") // Add label for y-axis
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-5.5em")
        .attr("x", -height / 2) // Center the text
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text("Alcohol Consumption (Liters per Capita)");

    // Add label for x-axis
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.top - padding / 2})`)
        .attr("text-anchor", "center")
        .attr("fill", "#000")
        .text("Year");

    // Add country select dropdown
    const countrySelect = document.getElementById('country-select');
    const countriesArray = Array.from(countries.keys());
    countriesArray.forEach(country => {
        const option = document.createElement('option');
        option.text = country;
        countrySelect.add(option);
    });

    // Get necessary HTML elements
    const startYearInput = document.getElementById('start-year');
    const endYearInput = document.getElementById('end-year');

    // Draw x-axis
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    // Event handling function
    function updateChart() {
        const selectedCountries = Array.from(countrySelect.selectedOptions).map(option => option.value);
        const startYear = parseInt(startYearInput.value);
        const endYear = parseInt(endYearInput.value);

        // Remove current chart
        svg.selectAll(".line").remove();
        svg.selectAll(".data-point").remove();
        svg.selectAll(".tooltip-line").remove();
        svg.selectAll(".country-label").remove();

        // Reset x-axis scale to display selected time range
        x.domain([new Date(startYear, 0, 1), new Date(endYear + 1, 0, 1)]);

        // Update x-axis
        xAxis.transition().call(d3.axisBottom(x));

        // Redraw chart for each selected country
        selectedCountries.forEach(country => {
            // Filter data by country and time range
            const filteredData = data.filter(d => d.Country === country && d.Year.getFullYear() >= startYear && d.Year.getFullYear() <= endYear);

            // Get the region for the country
            const region = countryToRegion.get(country);

            // Draw line for the country
            const line = d3.line()
                .x(d => x(d.Year))
                .y(d => y(d.alcohol_consumptions));

            svg.append("path")
                .data([filteredData])
                .attr("class", "line")
                .attr("d", line)
                .attr("stroke", regionColors(region))
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // Add bold dots for each year and display value on mouseover
            svg.selectAll("circle." + country)
                .data(filteredData)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.alcohol_consumptions))
                .attr("r", 5)
                .attr("fill", regionColors(region))
                .attr("class", "data-point " + country)
                .on("mouseover", (event, d) => {
                    // Show specific value on mouseover
                    svg.append("text")
                        .attr("x", x(d.Year) + 10)
                        .attr("y", y(d.alcohol_consumptions) - 10)
                        .text(d.alcohol_consumptions)
                        .attr("class", "tooltip-line");
                })
                .on("mouseout", () => {
                    // Remove tooltip on mouseout
                    svg.selectAll(".tooltip-line").remove();
                });

            // Add country label near the end of the line
            svg.append("text")
                .datum(filteredData[filteredData.length - 1])
                .attr("x", d => x(d.Year) + 5)
                .attr("y", d => y(d.alcohol_consumptions))
                .attr("class", "country-label")
                .style("fill", regionColors(region))
                .text(country);
        });
    }

    // Event handling for country and time range changes
    countrySelect.addEventListener('change', updateChart);
    startYearInput.addEventListener('input', updateChart);
    endYearInput.addEventListener('input', updateChart);

    // Default to show chart for the first country
    updateChart();
}).catch(error => {
    console.error("Error loading the CSV file:", error);
});

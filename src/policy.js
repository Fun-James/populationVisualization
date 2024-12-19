import * as d3 from "d3";

export function initializePolicyChart() {
    const csv = new URL('./assets/policy.csv', import.meta.url).href;
    // 定义颜色常量
    const colors = {
        birth: "rgb(47, 161, 255)",     
        upup: "#FFAA5F",      
        policy: "rgb(255, 60, 1)"     
    };

    const svg = d3.select("#policy").append("svg");
    const bRect = d3.select("#policy").node().getBoundingClientRect();
    const width = bRect.width;
    const height = bRect.height;
    svg.attr("width", width).attr("height", height);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "rgba(255, 255, 255, 0.95)")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("padding", "8px 12px")
        .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.2)")
        .style("font-family", "'Microsoft YaHei', sans-serif")
        .style("font-size", "14px")
        .style("line-height", "1.4")
        .style("pointer-events", "none")
        .style("z-index", "9999")
        .style("min-width", "150px");

    const tooltipContent = (year, value, type) => {
        const unit = type === "政策文件数量" ? "个" : "‰";
        return `
        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${year}年</div>
        <div style="color: #666;">${type}: <span style="color: #e4393c; font-weight: bold;">${value}${unit}</span></div>
    `;
    };

    d3.csv(csv).then((data, error) => {
        if (error) {
            console.log(error);
        } else {
            data.forEach(d => {
                d.year = +d.year;
                d.policy = +d.policy;
                d.birth = +d.birth;
                d.death = +d.death;
                d.upup = +d.upup;
            });

            const margin = { top: 50, right: 50, bottom: 70, left: 80 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;

            const periods = [
                { start: 1981, end: 1987, color: "rgba(253, 95, 122, 0.17)", label: "第一阶段" },
                { start: 1987, end: 2003, color: "rgba(253, 210, 134, 0.2)", label: "第二阶段" },
                { start: 2003, end: 2010, color: "rgba(125, 248, 125, 0.2)", label: "第三阶段" },
                { start: 2010, end: 2017, color: "rgba(219, 169, 219, 0.2)", label: "第四阶段" },
                { start: 2017, end: 2023, color: "rgba(108, 196, 230, 0.2)", label: "第五阶段" }
            ];

            // 定义比例尺
            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, d => d.year))
                .range([0, chartWidth]);

            const yLeftScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => Math.max(d.birth, d.upup))])
                .range([chartHeight, 0]);

            const yRightScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.policy)])
                .range([chartHeight, 0]);

            // 创建坐标轴
            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
                .ticks(20);
            const yLeftAxis = d3.axisLeft(yLeftScale);
            const yRightAxis = d3.axisRight(yRightScale);

            // 添加图表组
            const chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            // 绘制坐标轴
            chartGroup.append("g")
                .attr("transform", `translate(0, ${chartHeight})`)
                .call(xAxis);

            chartGroup.append("g")
                .call(yLeftAxis);

            chartGroup.append("g")
                .attr("transform", `translate(${chartWidth}, 0)`)
                .call(yRightAxis);

            // 添加坐标轴标签
            chartGroup.append("text")
                .attr("x", chartWidth / 2)
                .attr("y", chartHeight + margin.bottom - 20)
                .attr("text-anchor", "end")
                .attr("fill", "black")
                .text("年份");

            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -margin.top / 6)
                .attr("y", -margin.left + 50)
                .attr("text-anchor", "end")
                .attr("fill", "black")
                .text("出生率与自然增长率 (‰)");

            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -margin.top / 6)
                .attr("y", chartWidth + margin.right - 5)
                .attr("text-anchor", "end")
                .attr("fill", "black")
                .text("政策文件数量（个）");

// 在绘制线条之前添加背景
periods.forEach(period => {
    // 在每个时期的开始位置添加垂直虚线
    chartGroup.append("line")
        .attr("x1", xScale(period.start))
        .attr("x2", xScale(period.start))
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "#999")  // 使用灰色
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5")  // 设置为虚线
        .attr("class", "period-line");

    // // 添加时期标签
    // chartGroup.append("text")
    //     .attr("x", xScale(period.start))
    //     .attr("y", -10)  // 将标签放在图表上方
    //     .attr("text-anchor", "middle")
    //     .attr("fill", "#666")
    //     .attr("font-size", "12px")
    //     .text(period.label);
});
            // 定义线条生成器
            const lineBirth = d3.line()
                .x(d => xScale(d.year))
                .y(d => yLeftScale(d.birth));

            const lineUpup = d3.line()
                .x(d => xScale(d.year))
                .y(d => yLeftScale(d.upup));

            const linePolicy = d3.line()
                .x(d => xScale(d.year))
                .y(d => yRightScale(d.policy));

            // 绘制线条
            chartGroup.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors.birth)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("d", lineBirth);

            chartGroup.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors.upup)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("d", lineUpup);

            chartGroup.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", colors.policy)
                .attr("stroke-width", 2)
                .attr("d", linePolicy);

            // 添加数据点
            chartGroup.selectAll(".birth-points")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "birth-points")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yLeftScale(d.birth))
                .attr("r", 3)
                .attr("fill", colors.birth)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(tooltipContent(d.year, d.birth, "出生率"))
                        .style("left", (event.pageX - 160) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            chartGroup.selectAll(".upup-points")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "upup-points")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yLeftScale(d.upup))
                .attr("r", 3)
                .attr("fill", colors.upup)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(tooltipContent(d.year, d.upup, "自然增长率"))
                        .style("left", (event.pageX - 160) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            chartGroup.selectAll(".policy-points")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "policy-points")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yRightScale(d.policy))
                .attr("r", 3)
                .attr("fill", colors.policy)
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(tooltipContent(d.year, d.policy, "政策文件数量"))
                        .style("left", (event.pageX - 160) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            // 添加图例
            const legendData = [
                { name: "生育政策数量", color: colors.policy },
                { name: "出生率", color: colors.birth },
                { name: "自然增长率", color: colors.upup }
            ];

            const legend = chartGroup.selectAll(".legend")
                .data(legendData)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(0, ${i * 20 - 45})`);

            legend.append("line")
                .attr("x1", chartWidth - 160)
                .attr("x2", chartWidth - 130)
                .attr("y1", 5)
                .attr("y2", 5)
                .style("stroke", d => d.color)
                .style("stroke-width", 2)
                .style("stroke-dasharray", d =>
                    d.name === "生育政策数量" ? "none" : "5,5");

            legend.append("text")
                .attr("x", chartWidth - 125)
                .attr("y", 10)
                .attr("fill", "black")
                .text(d => d.name);
        }
    });
}



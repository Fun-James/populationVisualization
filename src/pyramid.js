import * as d3 from 'd3';
const csv2023 = new URL('./assets/China-2023.csv', import.meta.url).href;

// 获取容器元素并计算其尺寸
const container = d3.select(".a");
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = container.node().getBoundingClientRect().height;

// 设置画布尺寸和边距
const margin = { top: 20, right: 30, bottom: 30, left: 60 };
const width = containerWidth - margin.left - margin.right;
const height = containerHeight - margin.top - margin.bottom;

// 创建SVG容器
const svg = container
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 读取数据
d3.csv(csv2023).then(function (data) {
    // 计算总人口用于百分比计算
    const total = d3.sum(data, d => +d.M + +d.F);
    data.reverse();
    
    // 处理数据，计算百分比
    data.forEach(d => {
        d.maleCount = +d.M;
        d.femaleCount = +d.F;
        d.malePercent = -(+d.M / total * 100);
        d.femalePercent = (+d.F / total * 100);
    });


    
    // 创建x轴比例尺
    const x = d3.scaleLinear()
        .domain([-10, 10])
        .range([0, width]);

    // 创建y轴比例尺
    const y = d3.scaleBand()
        .domain(data.map(d => d.Age))
        .range([0, height])
        .padding(0.1);

    // 添加x轴
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d => Math.abs(d) + "%"));

    // 添加y轴
    svg.append("g")
        .call(d3.axisLeft(y));

    // 添加百分比标签
    svg.selectAll(".male-text")
        .data(data)
        .join("text")
        .attr("class", "percentage male-text")
        .attr("data-age", d => d.Age)
        .attr("x", d => x(d.malePercent) - 5)
        .attr("y", d => y(d.Age) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text(d => (Math.abs(d.malePercent)).toFixed(1) + "%");

    svg.selectAll(".female-text")
        .data(data)
        .join("text")
        .attr("class", "percentage female-text")
        .attr("data-age", d => d.Age)
        .attr("x", d => x(d.femalePercent) + 5)
        .attr("y", d => y(d.Age) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d.femalePercent.toFixed(1) + "%");

    // 处理鼠标悬停效果的函数
    function handleHoverEffect(age, show) {
        // 处理柱状图和百分比文本的显示/隐藏
        svg.selectAll(".male, .female")
            .filter(d => d.Age === age)
            .transition()
            .duration(200)
            .style("opacity", show ? 1 : 0);
    
        svg.selectAll(".percentage")
            .filter(d => d.Age === age)
            .transition()
            .duration(200)
            .style("opacity", show ? 1 : 0);
    
        if (!show) {
            const data = svg.selectAll(".male").filter(d => d.Age === age).data()[0];
            const centerX = x(0);
            const offset = 40; // 固定的标签偏移量
    
            // 添加男性人数文本 - 固定在左侧
            svg.append("text")
                .attr("class", "count-label male-count")
                .attr("x", centerX - offset)
                .attr("y", y(age) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")    // 加粗字体
                .style("fill", "steelblue")      // 设置男性颜色
                .style("pointer-events", "none")
                .text(d3.format(",")(Math.abs(data.maleCount)) );
    
            // 添加女性人数文本 - 固定在右侧
            svg.append("text")
                .attr("class", "count-label female-count")
                .attr("x", centerX + offset)
                .attr("y", y(age) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("font-weight", "bold")    // 加粗字体
                .style("fill", "#ee7989")      // 设置男性颜色
                .style("pointer-events", "none")
                .text(d3.format(",")(Math.abs(data.femaleCount)));
        } else {
            svg.selectAll(".count-label").remove();
        }
    }

    // 添加男性条形图
    svg.selectAll(".male")
        .data(data)
        .join("rect")
        .attr("class", "male")
        .attr("x", d => x(d.malePercent))
        .attr("y", d => y(d.Age))
        .attr("width", d => x(0) - x(d.malePercent))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            handleHoverEffect(d.Age, false);
        })
        .on("mouseout", function(event, d) {
            handleHoverEffect(d.Age, true);
        });

    // 添加女性条形图
    svg.selectAll(".female")
        .data(data)
        .join("rect")
        .attr("class", "female")
        .attr("x", x(0))
        .attr("y", d => y(d.Age))
        .attr("width", d => x(d.femalePercent) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", "#ee7989")
        .on("mouseover", function(event, d) {
            handleHoverEffect(d.Age, false);
        })
        .on("mouseout", function(event, d) {
            handleHoverEffect(d.Age, true);
        });

        svg.selectAll(".male, .female")
    .on("mouseover", null)
    .on("mouseout", null);

// 为每一行添加一个透明的矩形，覆盖整个行
svg.selectAll(".row-overlay")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "row-overlay")
    .attr("x", 0)
    .attr("y", d => y(d.Age))
    .attr("width", width)
    .attr("height", y.bandwidth())
    .attr("fill", "transparent")
    .on("mouseover", function(event, d) {
        handleHoverEffect(d.Age, false);
    })
    .on("mouseout", function(event, d) {
        handleHoverEffect(d.Age, true);
    });
    // 添加标题
    svg.append("text")
        .attr("x", x(-5))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Male");

    svg.append("text")
        .attr("x", x(5))
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Female");
});

// 添加窗口大小改变时的响应
window.addEventListener('resize', function() {
    const newWidth = container.node().getBoundingClientRect().width;
    const newHeight = container.node().getBoundingClientRect().height;
    svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
});
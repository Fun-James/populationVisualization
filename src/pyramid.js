import * as d3 from 'd3';

const yearData = {
    2023: csv = new URL('./assets/China-2023.csv', import.meta.url).href,
    2022: csv = new URL('./assets/China-2022.csv', import.meta.url).href,
    2021: csv = new URL('./assets/China-2021.csv', import.meta.url).href,
    2020: csv = new URL('./assets/China-2020.csv', import.meta.url).href,
    2019: csv = new URL('./assets/China-2019.csv', import.meta.url).href,
    2018: csv = new URL('./assets/China-2018.csv', import.meta.url).href,
    2017: csv = new URL('./assets/China-2017.csv', import.meta.url).href,
    2016: csv = new URL('./assets/China-2016.csv', import.meta.url).href,
    2015: csv = new URL('./assets/China-2015.csv', import.meta.url).href,
    2014: csv = new URL('./assets/China-2014.csv', import.meta.url).href,
    2013: csv = new URL('./assets/China-2013.csv', import.meta.url).href,
    2012: csv = new URL('./assets/China-2012.csv', import.meta.url).href,
    2011: csv = new URL('./assets/China-2011.csv', import.meta.url).href,
    2010: csv = new URL('./assets/China-2010.csv', import.meta.url).href,
    2009: csv = new URL('./assets/China-2009.csv', import.meta.url).href,
    2008: csv = new URL('./assets/China-2008.csv', import.meta.url).href,
    2007: csv = new URL('./assets/China-2007.csv', import.meta.url).href,
    2006: csv = new URL('./assets/China-2006.csv', import.meta.url).href,
    2005: csv = new URL('./assets/China-2005.csv', import.meta.url).href,
    2004: csv = new URL('./assets/China-2004.csv', import.meta.url).href,
    2003: csv = new URL('./assets/China-2003.csv', import.meta.url).href,
    2002: csv = new URL('./assets/China-2002.csv', import.meta.url).href,
    2001: csv = new URL('./assets/China-2001.csv', import.meta.url).href,
    2000: csv = new URL('./assets/China-2000.csv', import.meta.url).href,
    1999: csv = new URL('./assets/China-1999.csv', import.meta.url).href,
    1998: csv = new URL('./assets/China-1998.csv', import.meta.url).href,
    1997: csv = new URL('./assets/China-1997.csv', import.meta.url).href,
    1996: csv = new URL('./assets/China-1996.csv', import.meta.url).href,
    1995: csv = new URL('./assets/China-1995.csv', import.meta.url).href,
    1994: csv = new URL('./assets/China-1994.csv', import.meta.url).href,
    1993: csv = new URL('./assets/China-1993.csv', import.meta.url).href,
    1992: csv = new URL('./assets/China-1992.csv', import.meta.url).href,
    1991: csv = new URL('./assets/China-1991.csv', import.meta.url).href,
    1990: csv = new URL('./assets/China-1990.csv', import.meta.url).href,
    1989: csv = new URL('./assets/China-1989.csv', import.meta.url).href,
    1988: csv = new URL('./assets/China-1988.csv', import.meta.url).href,
    1987: csv = new URL('./assets/China-1987.csv', import.meta.url).href,
    1986: csv = new URL('./assets/China-1986.csv', import.meta.url).href,
    1985: csv = new URL('./assets/China-1985.csv', import.meta.url).href,
    1984: csv = new URL('./assets/China-1984.csv', import.meta.url).href,
    1983: csv = new URL('./assets/China-1983.csv', import.meta.url).href,
    1982: csv = new URL('./assets/China-1982.csv', import.meta.url).href,
    1981: csv = new URL('./assets/China-1981.csv', import.meta.url).href,
    1980: csv = new URL('./assets/China-1980.csv', import.meta.url).href,
    1979: csv = new URL('./assets/China-1979.csv', import.meta.url).href,
    1978: csv = new URL('./assets/China-1978.csv', import.meta.url).href,
    1977: csv = new URL('./assets/China-1977.csv', import.meta.url).href,
    1976: csv = new URL('./assets/China-1976.csv', import.meta.url).href,
    1975: csv = new URL('./assets/China-1975.csv', import.meta.url).href,
    1974: csv = new URL('./assets/China-1974.csv', import.meta.url).href,
    1973: csv = new URL('./assets/China-1973.csv', import.meta.url).href,
    1972: csv = new URL('./assets/China-1972.csv', import.meta.url).href,
    1971: csv = new URL('./assets/China-1971.csv', import.meta.url).href,
    1970: csv = new URL('./assets/China-1970.csv', import.meta.url).href,
    1969: csv = new URL('./assets/China-1969.csv', import.meta.url).href,
    1968: csv = new URL('./assets/China-1968.csv', import.meta.url).href,
    1967: csv = new URL('./assets/China-1967.csv', import.meta.url).href,
    1966: csv = new URL('./assets/China-1966.csv', import.meta.url).href,
    1965: csv = new URL('./assets/China-1965.csv', import.meta.url).href,
    1964: csv = new URL('./assets/China-1964.csv', import.meta.url).href,
    1963: csv = new URL('./assets/China-1963.csv', import.meta.url).href,
    1962: csv = new URL('./assets/China-1962.csv', import.meta.url).href,
    1961: csv = new URL('./assets/China-1961.csv', import.meta.url).href,
    1960: csv = new URL('./assets/China-1960.csv', import.meta.url).href,
    1959: csv = new URL('./assets/China-1959.csv', import.meta.url).href,
    1958: csv = new URL('./assets/China-1958.csv', import.meta.url).href,
    1957: csv = new URL('./assets/China-1957.csv', import.meta.url).href,
    1956: csv = new URL('./assets/China-1956.csv', import.meta.url).href,
    1955: csv = new URL('./assets/China-1955.csv', import.meta.url).href,
    1954: csv = new URL('./assets/China-1954.csv', import.meta.url).href,
    1953: csv = new URL('./assets/China-1953.csv', import.meta.url).href,
    1952: csv = new URL('./assets/China-1952.csv', import.meta.url).href,
    1951: csv = new URL('./assets/China-1951.csv', import.meta.url).href,
    1950: csv = new URL('./assets/China-1950.csv', import.meta.url).href
};
const alldata = {};

async function loadData() {
    for (const year in yearData) {
        alldata[year] = await d3.csv(yearData[year]);
    }
}
loadData();
// 获取容器元素并计算其尺寸
const container = d3.select(".a");
const containerWidth = container.node().getBoundingClientRect().width;
const containerHeight = container.node().getBoundingClientRect().height;

// 设置画布尺寸和边距
const margin = { top: 20, right: 30, bottom: 120, left: 60 }; // 增加底部边距以容纳滑动轴
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

// 创建年份范围和滑动轴
const years = d3.range(1950, 2024);
const sliderScale = d3.scaleLinear()
    .domain([1950, 2023])
    .range([0, width])
    .clamp(true);

    const slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", `translate(0,${height + 70})`);

// 创建滑动轴背景
slider.append("line")
    .attr("class", "track-background")
    .attr("x1", sliderScale.range()[0])
    .attr("x2", sliderScale.range()[1])
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 8)
    .attr("stroke-linecap", "round");

// 创建滑动轴轨道
slider.append("line")
    .attr("class", "track")
    .attr("x1", sliderScale.range()[0])
    .attr("x2", sliderScale.range()[1])
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 8)
    .attr("stroke-linecap", "round");

// 添加刻度marks
const tickValues = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const ticks = slider.selectAll(".tick")
    .data(tickValues)
    .enter()
    .append("g")
    .attr("class", "tick")
    .attr("transform", d => `translate(${sliderScale(d)},0)`);

ticks.append("line")
    .attr("y1", -10)
    .attr("y2", 10)
    .attr("stroke", "#999")
    .attr("stroke-width", 1);

ticks.append("text")
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text(d => d);

// 美化滑块
const handle = slider.append("g")
    .attr("class", "handle")
    .style("cursor", "pointer");

handle.append("circle")
    .attr("r", 12)
    .attr("fill", "#fff")
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))");

// 当前年份标签
const label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("y", -25)
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "#4a90e2");
// 处理鼠标悬停效果的函数
function handleHoverEffect(age, show) {
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
        const offset = 40;

        svg.append("text")
            .attr("class", "count-label male-count")
            .attr("x", centerX - offset)
            .attr("y", y(age) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "steelblue")
            .style("pointer-events", "none")
            .text(d3.format(",")(Math.abs(data.maleCount)));

        svg.append("text")
            .attr("class", "count-label female-count")
            .attr("x", centerX + offset)
            .attr("y", y(age) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#ee7989")
            .style("pointer-events", "none")
            .text(d3.format(",")(Math.abs(data.femaleCount)));
    } else {
        svg.selectAll(".count-label").remove();
    }
}

// 创建比例尺
const x = d3.scaleLinear()
    .domain([-10, 10])
    .range([0, width]);

const y = d3.scaleBand()
    .range([0, height])
    .padding(0.1);

// 添加x轴
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => Math.abs(d) + "%"));

// 添加y轴
const yAxis = svg.append("g");

// 更新图表的函数
async function updateChart(year) {

    const data = await d3.csv(yearData[year]);
    // 计算总人口
    const total = d3.sum(data, d => +d.M + +d.F);
    data.reverse();

    // 处理数据
    data.forEach(d => {
        d.maleCount = +d.M;
        d.femaleCount = +d.F;
        d.malePercent = -(+d.M / total * 100);
        d.femalePercent = (+d.F / total * 100);
    });

    // 更新y轴域
    y.domain(data.map(d => d.Age));
    yAxis.call(d3.axisLeft(y));

    // 更新男性条形图
    const males = svg.selectAll(".male")
        .data(data);

    males.enter()
        .append("rect")
        .attr("class", "male")
        .merge(males)
        .transition()
        .duration(0)
        .attr("x", d => x(d.malePercent))
        .attr("y", d => y(d.Age))
        .attr("width", d => x(0) - x(d.malePercent))
        .attr("height", y.bandwidth())
        .attr("fill", "steelblue");

    // 更新女性条形图
    const females = svg.selectAll(".female")
        .data(data);

    females.enter()
        .append("rect")
        .attr("class", "female")
        .merge(females)
        .transition()
        .duration(0)
        .attr("x", x(0))
        .attr("y", d => y(d.Age))
        .attr("width", d => x(d.femalePercent) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", "#ee7989");

    // 更新百分比标签
    const maleTexts = svg.selectAll(".male-text")
        .data(data);

    maleTexts.enter()
        .append("text")
        .attr("class", "percentage male-text")
        .merge(maleTexts)
        .attr("data-age", d => d.Age)
        .attr("x", d => x(d.malePercent) - 5)
        .attr("y", d => y(d.Age) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("font-size", "12px")
        .text(d => (Math.abs(d.malePercent)).toFixed(2) + "%");

    const femaleTexts = svg.selectAll(".female-text")
        .data(data);

    femaleTexts.enter()
        .append("text")
        .attr("class", "percentage female-text")
        .merge(femaleTexts)
        .attr("data-age", d => d.Age)
        .attr("x", d => x(d.femalePercent) + 5)
        .attr("y", d => y(d.Age) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(d => d.femalePercent.toFixed(2) + "%");

    // 更新行覆盖层
    const overlays = svg.selectAll(".row-overlay")
        .data(data);

    overlays.enter()
        .append("rect")
        .attr("class", "row-overlay")
        .merge(overlays)
        .attr("x", 0)
        .attr("y", d => y(d.Age))
        .attr("width", width)
        .attr("height", y.bandwidth())
        .attr("fill", "transparent")
        .on("mouseover", function (event, d) {
            handleHoverEffect(d.Age, false);
        })
        .on("mouseout", function (event, d) {
            handleHoverEffect(d.Age, true);
        });
}

// 初始化图表
updateChart(2023);

// 添加拖动事件
const drag = d3.drag()
    .on("drag", function(event) {
        const year = Math.round(sliderScale.invert(event.x));
        handle.attr("transform", `translate(${sliderScale(year)},0)`);
        label.attr("x", sliderScale(year)).text(year);
        updateChart(year);
    });
// 应用拖动事件到滑块
handle.call(drag);

// 初始化滑块位置
handle.attr("transform", `translate(${sliderScale(2023)},0)`);
label.attr("x", sliderScale(2023)).text(2023);

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

// 添加窗口大小改变时的响应
window.addEventListener('resize', function () {
    const newWidth = container.node().getBoundingClientRect().width;
    const newHeight = container.node().getBoundingClientRect().height;
    svg.attr("viewBox", `0 0 ${newWidth} ${newHeight}`);
});
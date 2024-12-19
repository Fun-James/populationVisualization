import * as d3 from 'd3';

// 导入两个CSV文件
const birthRateUrl = new URL('./assets/birthrateProvince.csv', import.meta.url).href;
const deathRateUrl = new URL('./assets/deathrateProvince.csv', import.meta.url).href;

// 将固定尺寸改为相对尺寸
const aspectRatio = 800 / 500; // 保持原始宽高比
let width = document.querySelector('.bdrate').clientWidth;
let height = width / aspectRatio;
const marginTop = 20;
const marginRight = 12;
const marginBottom = 30;
const marginLeft = 40;

// 存储所有线条元素
let birthPathElements;
let deathPathElements;
let selectedProvince = null;

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
    .style("z-index", "100")
    .style("min-width", "150px");
// 可选：为省份名添加样式
const tooltipContent = (province, year, value, type) => `
    <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${province}</div>
    <div style="color: #666;">年份: ${year}</div>
    <div style="color: #666;">${type}: <span style="color: #e4393c; font-weight: bold;">${value.toFixed(2)}‰</span></div>
`;

// 使用Promise.all同时加载两个数据集
Promise.all([
    d3.csv(birthRateUrl),
    d3.csv(deathRateUrl)
]).then(([birthData, deathData]) => {
    // 获取年份列表
    const years = birthData.columns.slice(1).map(d => +d.replace('年', ''));

    // 处理出生率数据
    const birthProvinces = processData(birthData, years);
    // 处理死亡率数据
    const deathProvinces = processData(deathData, years);

    // 创建颜色比例尺
    const birthColorScale = d3.scaleSequential()
        .domain([0, birthProvinces.length - 1])
        .interpolator(d3.interpolateRgb("rgb(20, 20, 145)", "#87CEEB"));

    const deathColorScale = d3.scaleSequential()
        .domain([0, deathProvinces.length - 1])
        .interpolator(d3.interpolateRgb("rgba(255, 0, 0, 0.51)", "rgba(241, 79, 4, 0.75)"));

    // 计算y轴域
    const yDomain = [0, Math.max(
        d3.max(birthProvinces, p => d3.max(p.values, v => v.value)),
        d3.max(deathProvinces, p => d3.max(p.values, v => v.value))
    )];

    // 比例尺
    const x = d3.scaleLinear()
        .domain(d3.extent(years))
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleLinear()
        .domain(yDomain)
        .nice()
        .range([height - marginBottom, marginTop]);

    // 线生成器
    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    // 创建SVG
    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .on("click", function (event) {
            // 确保点击的是 SVG 本身，而不是其他元素
            if (event.target === this) {
                // 重置标题
                title.text("各省出生率与死亡率变化趋势");

                // 重置所有线条的透明度
                birthPathElements.transition()
                    .duration(300)
                    .attr("opacity", 0.07);
                deathPathElements.transition()
                    .duration(300)
                    .attr("opacity", 0.07);

                // 触发地图重置
                const mapSvg = d3.select('#map-container').select('svg');
                if (!mapSvg.empty()) {
                    // 创建并触发点击事件
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    mapSvg.node().dispatchEvent(clickEvent);
                }

                // 清除选中的省份
                selectedProvince = null;
            }
        });

    // 添加标题
    const title = svg.append("text")
        .attr("x", width / 2)
        .attr("y", marginTop)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("各省出生率与死亡率变化趋势");

    // 添加坐标轴
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(years.length).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y));

    // 绘制出生率线条
    birthPathElements = svg.append("g")
        .selectAll(".birth-line")
        .data(birthProvinces)
        .enter()
        .append("path")
        .attr("class", "birth-line")
        .attr("fill", "none")
        .attr("stroke", (d, i) => birthColorScale(i))
        .attr("stroke-width", 2)
        .attr("d", d => line(d.values))
        .attr("opacity", 0.07)
        .attr("cursor", "pointer")  // 添加鼠标手型
        .on("click", (event, d) => {
            // 查找并触发地图上对应省份的点击
            const mapState = d3.select('#map-container')
                .select('svg')
                .selectAll('path')
                .filter(p => p && p.properties && p.properties.name === d.province);

            if (!mapState.empty()) {
                // 模拟点击事件
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                mapState.node().dispatchEvent(clickEvent);
            }
        })
        .on("mouseover", function (event, d) {
            // 如果有选中的省份，且当前不是选中的省份，则不显示tooltip
            if (selectedProvince && d.province !== selectedProvince) {
                return;
            }


            d3.select(this)
                .attr("stroke-width", 4);

            const mouseX = event.pageX;
            const mouseY = event.pageY;

            // 获取鼠标位置对应的数据点
            const x0 = x.invert(d3.pointer(event)[0]);
            const bisect = d3.bisector(d => d.year).left;
            const i = bisect(d.values, x0);
            const dataPoint = d.values[i];

            if (dataPoint) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(tooltipContent(d.province, dataPoint.year, dataPoint.value, "出生率"))
                    .style("left", `${mouseX + 10}px`)  // 水平方向稍微偏移，避免被鼠标遮挡
                    .style("top", `${mouseY - tooltip.node().getBoundingClientRect().height - 10}px`);  // 垂直方向上移tooltip的高度，再额外偏移10px
            }
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", 2);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // 绘制死亡率线条
    deathPathElements = svg.append("g")
        .selectAll(".death-line")
        .data(deathProvinces)
        .enter()
        .append("path")
        .attr("class", "death-line")
        .attr("fill", "none")
        .attr("stroke", (d, i) => deathColorScale(i))
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4") // 使用虚线区分死亡率
        .attr("d", d => line(d.values))
        .attr("opacity", 0.07)
        .attr("cursor", "pointer")  // 添加鼠标手型
        .on("click", (event, d) => {
            // 查找并触发地图上对应省份的点击
            const mapState = d3.select('#map-container')
                .select('svg')
                .selectAll('path')
                .filter(p => p && p.properties && p.properties.name === d.province);

            if (!mapState.empty()) {
                // 模拟点击事件
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                mapState.node().dispatchEvent(clickEvent);
            }


        })
        .on("mouseover", function (event, d) {
            // 如果有选中的省份，且当前不是选中的省份，则不显示tooltip
            if (selectedProvince && d.province !== selectedProvince) {
                return;
            }

            d3.select(this)
                .attr("stroke-width", 4);

            const mouseX = event.pageX;
            const mouseY = event.pageY;

            const x0 = x.invert(d3.pointer(event)[0]);
            const bisect = d3.bisector(d => d.year).left;
            const i = bisect(d.values, x0);
            const dataPoint = d.values[i];

            if (dataPoint) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(tooltipContent(d.province, dataPoint.year, dataPoint.value, "死亡率"))
                    .style("left", `${mouseX + 10}px`)  // 水平方向稍微偏移，避免被鼠标遮挡
                    .style("top", `${mouseY - tooltip.node().getBoundingClientRect().height - 10}px`);  // 垂直方向上移tooltip的高度，再额外偏移10px
            }
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", 2);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    // 添加图例
    const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight - 100}, ${marginTop + 10})`);

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "rgb(8, 97, 185)")
        .attr("stroke-width", 2);

    legend.append("line")
        .attr("x1", 0)
        .attr("x2", 20)
        .attr("y1", 20)
        .attr("y2", 20)
        .attr("stroke", "rgba(241, 28, 4, 0.75)")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 4)
        .text("出生率");

    legend.append("text")
        .attr("x", 25)
        .attr("y", 24)
        .text("死亡率");

    // 将SVG添加到页面
    document.querySelector('.bdrate').appendChild(svg.node());

    // 更新交互事件
    document.addEventListener('provinceSelected', (event) => {
        selectedProvince = event.detail.province;
        // 移除已有的填充区域
        svg.selectAll('.fill-area').remove();

        if (!selectedProvince) {
            title.text("各省出生率与死亡率变化趋势");
            birthPathElements.transition()
                .duration(300)
                .attr("opacity", 0.07);
            deathPathElements.transition()
                .duration(300)
                .attr("opacity", 0.07);
        } else {
            title.text(`${selectedProvince}出生率与死亡率变化趋势`);
            birthPathElements.transition()
                .duration(300)
                .attr("opacity", d => d.province === selectedProvince ? 1 : 0.07);
            deathPathElements.transition()
                .duration(300)
                .attr("opacity", d => d.province === selectedProvince ? 1 : 0.07);

            // 获取选中省份的数据
            const birthData = birthProvinces.find(d => d.province === selectedProvince);
            const deathData = deathProvinces.find(d => d.province === selectedProvince);

            // 创建填充区域生成器
            const areaGenerator = d3.area()
                .x(d => x(d.year))
                .y0(d => y(d.birthRate))
                .y1(d => y(d.deathRate));

            // 合并数据以创建填充区域
            const fillData = years.map(year => {
                const birthValue = birthData.values.find(v => v.year === year).value;
                const deathValue = deathData.values.find(v => v.year === year).value;
                return {
                    year: year,
                    birthRate: birthValue,
                    deathRate: deathValue
                };
            });

            // 分段绘制填充区域
            // 修改 fillData.forEach 部分的代码如下：
            fillData.forEach((d, i) => {
                if (i === 0) return; // 跳过第一个点

                const prev = fillData[i - 1];
                const curr = d;

                // 检查是否存在交叉点
                const prevDiff = prev.birthRate - prev.deathRate;
                const currDiff = curr.birthRate - curr.deathRate;

                // 如果存在交叉点（差值正负号不同）
                if (prevDiff * currDiff < 0) {
                    // 计算交叉点
                    const ratio = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(currDiff));
                    const crossYear = prev.year + (curr.year - prev.year) * ratio;

                    // 使用线性插值计算交叉点的值
                    const crossValue = prev.birthRate + (curr.birthRate - prev.birthRate) * ratio;

                    // 创建交叉点数据
                    const crossPoint = {
                        year: crossYear,
                        birthRate: crossValue,
                        deathRate: crossValue
                    };

                    // 分别绘制交叉点前后的区域
                    // 交叉点之前的区域
                    svg.append('path')
                        .attr('class', 'fill-area')
                        .datum([prev, crossPoint])
                        .attr('fill', prevDiff > 0 ?
                            'rgba(144, 238, 144, 0.3)' : // 浅绿色表示人口增长
                            'rgba(255, 182, 193, 0.3)')  // 浅红色表示人口减少
                        .attr('d', areaGenerator);

                    // 交叉点之后的区域
                    svg.append('path')
                        .attr('class', 'fill-area')
                        .datum([crossPoint, curr])
                        .attr('fill', currDiff > 0 ?
                            'rgba(144, 238, 144, 0.3)' :
                            'rgba(255, 182, 193, 0.3)')
                        .attr('d', areaGenerator);
                } else {
                    // 如果没有交叉点，按原来的方式处理
                    const segmentData = [prev, curr];
                    const fillColor = prevDiff > 0 ?
                        'rgba(144, 238, 144, 0.3)' :
                        'rgba(255, 182, 193, 0.3)';

                    svg.append('path')
                        .attr('class', 'fill-area')
                        .datum(segmentData)
                        .attr('fill', fillColor)
                        .attr('d', areaGenerator);
                }
            });
        }
    });
});

// 数据处理函数
function processData(data, years) {
    const provinces = data.map(d => {
        const values = years.map(year => {
            return { year: year, value: +d[year + '年'] };
        });
        const average = d3.mean(values, v => v.value);
        return {
            province: d['地区'],
            values: values,
            average: average
        };
    });
    return provinces.sort((a, b) => b.average - a.average);
}


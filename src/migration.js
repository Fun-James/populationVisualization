import * as d3 from "d3";

const csv = new URL('./assets/migration.csv', import.meta.url).href;

// 添加tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(255, 255, 255, 0.95)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("padding", "4px 8px")
    .style("box-shadow", "1px 1px 3px rgba(0, 0, 0, 0.2)")
    .style("font-family", "'Microsoft YaHei', sans-serif")
    .style("font-size", "12px")
    .style("line-height", "1.2")
    .style("pointer-events", "none")
    .style("z-index", "100")
    .style("min-width", "80px");

// 定义SVG画布
const svg = d3.select("#migration-chart");
const width = 650;
const height = 300;
svg.attr("width", width).attr("height", height);

let migrationData;

// 加载数据
d3.csv(csv).then((data) => {
  migrationData = data;
  // 初始化显示北京市数据
  updateChart("北京市");
});

// 监听省份选择事件
document.addEventListener('provinceSelected', (e) => {
  const provinceName = e.detail.province;
  if (provinceName === null) {
    // 如果重置了选择，显示北京市数据
    updateChart("北京市");
  } else {
    updateChart(provinceName);
  }
});

// 定义更新图表的函数
function updateChart(province) {
  svg.selectAll("*").remove();

  const margin = { top: 50, right: 20, bottom: 50, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // 添加标题
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 30)
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text(`${province}的人口迁移`);

  const data = migrationData.find(d => d.地区 === province);
  if (!data) {
    console.log("未找到对应省份的数据");
    return;
  }

  const regions = ["华北", "东北", "华东", "中南", "西南", "西北"];
  const regionValues = regions.map(region => +data[region]);
  const total = d3.sum(regionValues);

  const color = [
    "#f46d43", // 红色 (<10岁)
  
    "#fee08b", // 亮黄色 (30-39岁)

    "#e6f598", // 浅黄色 (50-59岁)
    "#abdda4", // 绿色 (60-69岁)
    "#66c2a5", // 浅绿色 (70-79岁)
    "#3288bd"  // 蓝色 (≥80岁)
  ];

  let cumulative = 0;
  const segments = regionValues.map((value, index) => {
    const segment = {
      x: (cumulative / total) * chartWidth + margin.left,
      width: (value / total) * chartWidth,
      color: color[index],
      region: regions[index],
      value: ((value / total) * 100).toFixed(2), // 百分比
      rawValue: value // 添加原始人数
    };
    cumulative += value;
    return segment;
  });

  // 绘制带状图
  svg.selectAll("rect")
    .data(segments)
    .enter()
    .append("rect")
    .attr("x", d => d.x)
    .attr("y", margin.top + 20)
    .attr("width", d => d.width)
    .attr("height", 40)
    .attr("fill", d => d.color)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      tooltip
        .style("display", "block")
        .transition()
        .duration(200)
        .style("opacity", 1);
    
      // 添加具体人数显示
      tooltip.html(`
        <div style="font-weight: bold; color: #333;">
          ${d.region}
        </div>
        <div style="color: #666;">
          比例: ${d.value}%
        </div>
        <div style="color: #666;">
          人数: ${d3.format(",")(d.rawValue)}人
        </div>
      `);
    

      // 获取当前鼠标所在矩形的位置信息
      const rect = event.target.getBoundingClientRect();

      // 计算tooltip位置 - 放在矩形正上方
      const tooltipHeight = tooltip.node().offsetHeight;
      const top = rect.top + window.pageYOffset - tooltipHeight - 5;
      const left = rect.left + window.pageXOffset + (rect.width / 2);

      tooltip
        .style("left", left + "px")
        .style("top", top + "px")
        .style("transform", "translateX(-50%)");
    })
    .on("mouseout", function() {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", function() {
          tooltip.style("display", "none");
        });
    });

  // 添加图例
  const legendsPerRow = 3;
  const legendGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top + 80})`);

  // 间距参数
  const legendSpacing = {
    horizontal: 170,
    vertical: 30,
    rectTextGap: 20
  };

  const legends = legendGroup.selectAll(".legend")
    .data(segments)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) =>
      `translate(${(i % legendsPerRow) * legendSpacing.horizontal},
                ${Math.floor(i / legendsPerRow) * legendSpacing.vertical})`);

  legends.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => d.color);

    legends.append("text")
    .attr("x", legendSpacing.rectTextGap)
    .attr("y", 10)
    .attr("font-size", "12px")
    .text(d => `${d.region} (${d.value}% | ${d3.format(",")(d.rawValue)}人)`);
}
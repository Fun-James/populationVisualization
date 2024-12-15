import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

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
const height = 270;
svg.attr("width", width).attr("height", height);

let migrationData;

// 创建省份到区域的映射
const provinceToRegion = {
  "北京市": "华北",
  "天津市": "华北",
  "河北省": "华北",
  "山西省": "华北",
  "内蒙古自治区": "华北",
  "辽宁省": "东北",
  "吉林省": "东北",
  "黑龙江省": "东北",
  "上海市": "华东",
  "江苏省": "华东",
  "浙江省": "华东",
  "安徽省": "华东",
  "福建省": "华东",
  "江西省": "华东",
  "山东省": "华东",
  "河南省": "中南",
  "湖北省": "中南",
  "湖南省": "中南",
  "广东省": "中南",
  "广西壮族自治区": "中南",
  "海南省": "中南",
  "重庆市": "西南",
  "四川省": "西南",
  "贵州省": "西南",
  "云南省": "西南",
  "西藏自治区": "西南",
  "陕西省": "西北",
  "甘肃省": "西北",
  "青海省": "西北",
  "宁夏回族自治区": "西北",
  "新疆维吾尔自治区": "西北",
};


// 初始化时显示全国数据
d3.csv(csv).then((data) => {
  migrationData = data;
  updateChart("全国");
});

// 监听省份选择事件
document.addEventListener('provinceSelected', (e) => {
  const provinceName = e.detail.province;
  if (provinceName === null) {
    // 如果重置了选择，显示全国数据
    updateChart("全国");
  } else {
    updateChart(provinceName);
  }
});

// 定义更新图表的函数
function updateChart(province) {
  svg.selectAll("*").remove();

  if (province === "全国") {
   // 1. 基本参数设置 - 交换宽度和高度
   const margin = { top: 10, right: 20, bottom: 10, left: 45 };
   // 注意：这里交换了width和height
   const chartWidth = height - margin.left - margin.right;
   const chartHeight = width - margin.top - margin.bottom;
 
   // 在SVG容器中创建一个组用于旋转
   const rotatedGroup = svg.append("g")
     .attr("transform", `translate(${width}, 0) rotate(90)`);
 
   const regions = ["华北", "东北", "华东", "中南", "西南", "西北"];
 

   svg.append("text")
      .attr("x", margin.left/2)
      .attr("y", 15)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(`${province}的人口迁移去向`);
 

  // 2. 处理数据结构
  const nodes = [];
  const links = [];
  
  // 添加源节点和目标节点
  regions.forEach((region, i) => {
    // 源节点
    nodes.push({
      id: region + "_source",
      name: region,
      type: "source"
    });
    // 目标节点
    nodes.push({
      id: region + "_target",
      name: region,
      type: "target"
    });
  });

  // 创建连接
  migrationData.forEach(row => {
    const sourceRegion = provinceToRegion[row["地区"]];
    regions.forEach(targetRegion => {
      if (sourceRegion && row[targetRegion]) {
        links.push({
          source: sourceRegion + "_source",
          target: targetRegion + "_target",
          value: +row[targetRegion]
        });
      }
    });
  });

  // 3. 创建桑基图
  const sankeyGenerator = sankey()
    .nodeId(d => d.id)
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[margin.left, margin.top], [chartWidth - margin.right, chartHeight - margin.bottom]])
    .nodeSort((a, b) => regions.indexOf(a.name) - regions.indexOf(b.name));


  // 4. 生成数据
  const graph = sankeyGenerator({
    nodes: nodes,
    links: links
  });

  // 5. 颜色比例尺
  const color = d3.scaleOrdinal()
    .domain(regions)
    .range(["#f46d43", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"]);

  // 6. 绘制连接
  rotatedGroup.append("g")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", d => color(d.source.name.replace("_source", "")))
    .attr("stroke-width", d => Math.max(1, d.width))
    .attr("opacity", 0.5)
    .on("mouseover", function(event, d) {
      tooltip.style("display", "block")
        .transition()
        .duration(200)
        .style("opacity", 1);
      
      tooltip.html(`
        <div style="font-weight: bold; color: #333;">
          ${d.source.name.replace("_source", "")} → ${d.target.name.replace("_target", "")}
        </div>
        <div style="color: #666;">
          人数: ${d3.format(",")(d.value)}
        </div>
      `);

      const rect = event.target.getBoundingClientRect();
      const tooltipHeight = tooltip.node().offsetHeight;
      const top = rect.top + window.pageYOffset - tooltipHeight - 5;
      const left = rect.left + window.pageXOffset + (rect.width / 2);

      tooltip.style("left", left + "px")
        .style("top", top + "px")
        .style("transform", "translateX(-50%)");
    })
    .on("mouseout", function() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", function() {
          tooltip.style("display", "none");
        });
    });

  // 7. 绘制节点
  const node = rotatedGroup.append("g")
  .selectAll("g")
  .data(graph.nodes)
  .join("g");

  node.append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => color(d.name.replace("_source", "").replace("_target", "")))
    .attr("stroke", "#888888");

  // 8. 添加标签
  node.append("text")
    .attr("x", d => d.type === "source" ? d.x0 - 0 : d.x1 -5)
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.type === "source" ? "end" : "start")
    .attr("transform", d => {
      const x = d.type === "source" ? d.x0 - 10 : d.x1 + 10;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(-90, ${x}, ${y})`;
    })
    .style("font-family", "'PingFang SC', 'Microsoft YaHei', sans-serif")
    .style("font-size", "14px")
    .style("font-weight", "500")
    .style("letter-spacing", "1px")
    .text(d => d.name.replace("_source", "").replace("_target", ""));


  } else {
      // 1. 基本参数设置
      const margin = { top: 50, right: 20, bottom: 50, left: 20 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
  const regions = ["华北", "东北", "华东", "中南", "西南", "西北"];
  let regionValues;
    // 10. 处理单个省份数据
    const data = migrationData.find(d => d.地区 === province);
    if (!data) {
      console.log("未找到对应省份的数据");
      return;
    }
    regionValues = regions.map(region => +data[region]);

    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 30)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(`${province}的人口迁移去向`);

    // 11. 处理省份数据可视化
    const total = d3.sum(regionValues);
    const color = ["#f46d43", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"];

    let cumulative = 0;
    const segments = regionValues.map((value, index) => {
      const segment = {
        x: (cumulative / total) * chartWidth + margin.left,
        width: (value / total) * chartWidth,
        color: color[index],
        region: regions[index],
        value: ((value / total) * 100).toFixed(2),
        rawValue: value
      };
      cumulative += value;
      return segment;
    });

    // 12. 绘制带状图
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
        tooltip.style("display", "block")
          .transition()
          .duration(200)
          .style("opacity", 1);
        
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

        const rect = event.target.getBoundingClientRect();
        const tooltipHeight = tooltip.node().offsetHeight;
        const top = rect.top + window.pageYOffset - tooltipHeight - 5;
        const left = rect.left + window.pageXOffset + (rect.width / 2);

        tooltip.style("left", left + "px")
          .style("top", top + "px")
          .style("transform", "translateX(-50%)");
      })
      .on("mouseout", function() {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0)
          .on("end", function() {
            tooltip.style("display", "none");
          });
      });

    // 13. 添加图例
    const legendsPerRow = 3;
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top + 80})`);

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
}
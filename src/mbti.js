import * as d3 from "d3";

const csv = new URL('./assets/mbti.csv', import.meta.url).href;

// 添加tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "rgba(255, 255, 255, 0.95)")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")  // 减小圆角
    .style("padding", "4px 8px")    // 减小内边距
    .style("box-shadow", "1px 1px 3px rgba(0, 0, 0, 0.2)")  // 减小阴影
    .style("font-family", "'Microsoft YaHei', sans-serif")
    .style("font-size", "12px")     // 减小字体
    .style("line-height", "1.2")    // 减小行高
    .style("pointer-events", "none")
    .style("z-index", "100")
    .style("min-width", "80px");    // 减小最小宽度

const svg = d3.select("#mbti-chart");
const width = 650;
const height = 300;
svg.attr("width", width).attr("height", height);

let mbtiData;

// 加载数据
d3.csv(csv).then((data) => {
  mbtiData = data;
  // 初始化显示北京数据
  updateChart("北京市");
});

// 监听省份选择事件
document.addEventListener('provinceSelected', (e) => {
  const provinceName = e.detail.province;
  if (provinceName === null) {
    // 如果重置了选择，显示北京数据
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
    .text(`${province}的MBTI分布`);

  const data = mbtiData.find(d => d.地区 === province);
  if (!data) {
    console.log("未找到对应省份的数据");
    return;
  }

  const mbtiTypes = ["ISTJ", "ESTJ", "ISTP", "ESTP", "ISFJ", "ESFJ", "ISFP", "ESFP", "INFJ", "ENFJ", "INFP", "ENFP", "INTJ", "ENTJ", "INTP", "ENTP"];
  const mbtiValues = mbtiTypes.map(type => +data[type]);
  const total = d3.sum(mbtiValues);
  const color = [
    // IS__ 系列
    "#4a90e2", // ISTJ - 深蓝
    "#5d9cec", // ESTJ
    "#5bc0de", // ISTP - 浅蓝
    "#70d6ff", // ESTP
  
    // ES__ 系列  
    "#50c878", // ISFJ - 深绿
    "#68d89b", // ESFJ
    "#7bed9f", // ISFP - 浅绿
    "#95f3b4", // ESFP
  
    // IN__ 系列
    "#c471ed", // INFJ - 深紫
    "#d387f7", // ENFJ
    "#e1a1ff", // INFP - 浅紫
    "#eeb5ff", // ENFP
  
    // EN__ 系列
    "#ff7f50", // INTJ - 深橙
    "#ff9770", // ENTJ
    "#ffaf90", // INTP - 浅橙
    "#ffc5a8"  // ENTP
  ];

  let cumulative = 0;
  const segments = mbtiValues.map((value, index) => {
    const segment = {
      x: (cumulative / total) * chartWidth + margin.left,
      width: (value / total) * chartWidth,
      color: color[index],
      type: mbtiTypes[index],
      value: value.toFixed(2)
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
        
    // 简化的 tooltip 内容
    tooltip.html(`
        <div style="font-weight: bold; color: #333;">
            ${d.type}
        </div>
        <div style="color: #666;">
            ${d.value}%
        </div>
    `);

    // 获取当前鼠标所在矩形的位置信息
    const rect = event.target.getBoundingClientRect();
    
    // 计算 tooltip 位置 - 放在矩形正上方
    const tooltipHeight = tooltip.node().offsetHeight;
    const top = rect.top + window.pageYOffset - tooltipHeight - 5; // 在矩形上方5px
    const left = rect.left + window.pageXOffset + (rect.width / 2); // 水平居中
    
    tooltip
        .style("left", left + "px")
        .style("top", top + "px")
        .style("transform", "translateX(-50%)"); // 使tooltip水平居中
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
const legendsPerRow = 6;
const legendGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top + 80})`);

// 增加间距参数
const legendSpacing = {
  horizontal: 100,  
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
    .attr("fill", d => d.color)


legends.append("text")
    .attr("x", legendSpacing.rectTextGap)
    .attr("y", 10)
    .attr("font-size", "12px")
    .text(d => `${d.type}(${d.value}%)`);
}
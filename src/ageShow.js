import * as d3 from 'd3';

let nationalData = [];
let combinedData = [];
let combinedData2 = [];
let selectedProvince = '全国';
let selectedLayout = "grouped";

// 添加全国平均数据的加载
const csvurlAvg = new URL('./assets/average.csv', import.meta.url).href;


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

// 定义 tooltip 内容格式
const tooltipContent = (province, year, value, type) => `
    <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${province}</div>
    <div style="color: #666;">年份: ${year}</div>
    <div style="color: #666;">${type}: <span style="color: #e4393c; font-weight: bold;">${value}</span></div>
`;

function createRadioButton() {
  const buttonContainer = document.getElementById('button-container')
  buttonContainer.style.position = 'relative';
  buttonContainer.style.margin = '-35px 60px 15px';

  const form = document.createElement('form');
  form.style.display = 'flex';
  form.style.gap = '15px';

  const options = ["Stacked", "Grouped"];

  options.forEach((label) => {
    const radioLabel = document.createElement('label');
    Object.assign(radioLabel.style, {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#ffffff',
      color: '#555',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      userSelect: 'none'
    });

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'layout';
    radio.value = label.toLowerCase();
    Object.assign(radio.style, {
      marginRight: '8px',
      cursor: 'pointer'
    });

    if (label === "Grouped") radio.checked = true;
    if (label === "Stacked" && selectedProvince === '全国') {
      radio.disabled = true;
      radioLabel.style.opacity = '0.6'; // 调整样式表示不可用
    }
    radioLabel.appendChild(radio);
    radioLabel.appendChild(document.createTextNode(label));

    // 添加悬停效果
    radioLabel.addEventListener('mouseover', () => {
      radioLabel.style.backgroundColor = '#f0f0f0';
      radioLabel.style.borderColor = '#ccc';
    });

    radioLabel.addEventListener('mouseout', () => {
      radioLabel.style.backgroundColor = '#ffffff';
      radioLabel.style.borderColor = '#e0e0e0';
    });

    // 选中状态样式
    radio.addEventListener('change', () => {
      form.querySelectorAll('label').forEach(l => {
        l.style.backgroundColor = '#ffffff';
        l.style.borderColor = '#e0e0e0';
        l.style.color = '#555';
      });
      if (radio.checked) {
        radioLabel.style.backgroundColor = '#f0f7ff';
        radioLabel.style.borderColor = '#3288bd';
        radioLabel.style.color = '#3288bd';
      }
    });

    form.appendChild(radioLabel);
  });

  buttonContainer.appendChild(form);

  form.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === 'stacked' && selectedProvince === '全国') {
      // 如果选择了 'stacked' 并且当前选择的是 '全国'，则切换回 'grouped'
      form.querySelector('input[value="grouped"]').checked = true;
      selectedLayout = 'grouped';
    } else {
      selectedLayout = selectedValue;
    }
    updateChart(selectedProvince, selectedLayout);
  });

  // 初始化选中状态样式
  const firstRadio = form.querySelector('input[type="radio"]:checked');
  if (firstRadio) {
    const label = firstRadio.parentElement;
    label.style.backgroundColor = '#f0f7ff';
    label.style.borderColor = '#3288bd';
    label.style.color = '#3288bd';
  }

  // 检查初始状态
  if (selectedProvince === '全国' && selectedLayout === 'stacked') {
    form.querySelector('input[value="grouped"]').checked = true;
    selectedLayout = 'grouped';
  }
}


const csvurl4 = new URL('./assets/allpeople.csv', import.meta.url).href;
const csvurl5 = new URL('./assets/malefemale.csv', import.meta.url).href;

const loadData2 = () => {
  return Promise.all([
    d3.csv(csvurl4),  // 读取总人数数据
    d3.csv(csvurl5),   // 读取男女性别比例数据
    d3.csv(csvurlAvg)  // 读取全国平均数据
  ]);
};

loadData2().then(([allPeopleData, maleFemaleData,avgData]) => {
   // 处理全国平均数据
   const years = Object.keys(avgData[0]).filter(key => key !== 'year');
   years.forEach(year => {
     nationalData.push({
       region: '全国',
       year: year,
       male: +avgData.find(d => d.year === 'male')[year] , // 转换为具体人数
       female: +avgData.find(d => d.year === 'female')[year]
     });
   });

  allPeopleData.forEach((personRecord, index) => {
    const region = personRecord['地区']; // 获取地区
    const years = Object.keys(personRecord).filter(year => year !== '地区'); // 获取所有年份
    years.forEach(year => {
      const total = parseInt(personRecord[year]); // 获取该年份的总人数

      const ratio = maleFemaleData.find(record => record['地区'] === region); // 查找对应的性别比例数据
      if (ratio) {
        const maleRatio = parseFloat(ratio[year]); // 获取该地区该年份的性别比例（男对女）

        // 计算男性和女性比例
        const femaleRatio = 100; // 女性默认是100
        const male = Math.round(total * maleRatio / (maleRatio + femaleRatio)); // 计算男性人数
        const female = total - male; // 计算女性人数
        
        // 将数据合并到最终的数组中
        combinedData2.push({
          region,
          year,
          male,
          female
        });
      }
    });
  });
  combinedData2 = combinedData2.concat(nationalData);
}).catch((error) => {
  console.error('Error loading data:', error);
});



const csvurl1 = new URL('./assets/child.csv', import.meta.url).href;
const csvurl2 = new URL('./assets/adult.csv', import.meta.url).href;
const csvurl3 = new URL('./assets/elder.csv', import.meta.url).href;
const csvurl6 = new URL('./assets/allpeople.csv', import.meta.url).href;

const loadData = () => {
  return Promise.all([
    d3.csv(csvurl1),
    d3.csv(csvurl2),
    d3.csv(csvurl3),
    d3.csv(csvurl6),
    d3.csv(csvurlAvg)
  ]);
};

loadData().then(([data1, data2, data3, totalPopulation,avgData]) => {
  
  // 处理全国平均数据
  const years = Object.keys(avgData[0]).filter(key => key !== 'year');
  years.forEach(year => {
    const totalNational = 10000; // 设置基数
    combinedData.push({
      province: '全国',
      year: year,
      child: +avgData.find(d => d.year === 'child')[year] * totalNational,
      adult: +avgData.find(d => d.year === 'adult')[year] * totalNational,
      elder: +avgData.find(d => d.year === 'elder')[year] * totalNational
    });
  });
  
  
  data1.forEach((item, index) => {
    const province = item['地区'];
    const years = Object.keys(item).filter(key => key !== '地区');
    years.forEach(year => {
      const total = +totalPopulation[index][year]; // 获取总人口数
      combinedData.push({
        province: province,
        year: year,
        child: +item[year] * total, // 按比例计算具体人数
        adult: +data2[index][year] * total,
        elder: +data3[index][year] * total
      });
    });
  });
  // 初始化图表
  updateChart('全国', selectedLayout);
  createRadioButton();
  // 添加窗口大小改变时的自适应
  window.addEventListener('resize', () => {
    updateChart(selectedProvince || '全国', selectedLayout);
  });
}).catch(error => {
  console.error('读取 CSV 文件失败：', error);
});





function updateChart(province, layout = "stacked") {
  if (province === '全国' && layout === "stacked") {
    // 当选择全国并且布局为 stacked 时，不执行任何操作
    return;
  }
  // 在 updateChart 函数开始处添加一个判断是否首次创建的标志
  const isFirstRender = d3.select('#ageshow-container .y-axis-left').empty();
  const container = document.getElementById('ageshow-container');
  const containerRect = container.getBoundingClientRect();

  const margin = { top: 10, right: 100, bottom: 17, left: 60 };
  const width = Math.max(300, containerRect.width - margin.left - margin.right);
  const height = Math.max(200, containerRect.height - margin.top - margin.bottom - 40);

  const data = combinedData.filter(d => d.province === province);
  if (data.length === 0) return;


  
  const years = data.map(d => d.year);
  // 计算每年各年龄段的总人数和比例
  const yz = data.map(d => {
    const total = d.child + d.adult + d.elder;
    if (layout === "grouped") {
      // grouped模式返回比例数据
      return [
        d.child / total,
        d.adult / total,
        d.elder / total
      ];
    } else {
      // stacked模式返回原始数据
      return [d.child, d.adult, d.elder];
    }
  });
  const n = 3;

  const yStackMax = d3.max(yz, y => d3.sum(y));
  const yGroupMax = d3.max(yz, y => d3.max(y));

  const x = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);


  // 1. 获取所有省份的最大 total 值
  const globalMaxTotal = d3.max(combinedData2, d => d.male + d.female);

  // 计算所有省份的最大总人口
  const maxPopulation = d3.max(combinedData2, d => d.male + d.female);

  // 计算所有省份年龄段数据的最大值
  const maxAgeGroupValue = d3.max(combinedData, d => {
    const total = d.child + d.adult + d.elder;
    return Math.max(d.child, d.adult, d.elder);
  });

  // 使用全局最大值设置比例尺
  const yLeft = d3.scaleLinear()
    .domain([0, layout === "grouped" ? 1 : maxAgeGroupValue * 1.35])
    .range([height, 0]);



  // 1. 准备包含总人数、男性和女性数据的数组
  const maleFemaleData = combinedData2.filter(d => d.region === province).map(d => ({
    year: d.year,
    total: d.male + d.female,  // 计算总人数
    male: d.male / (d.male + d.female),  // 男性比例
    female: d.female / (d.male + d.female)  // 女性比例
  }));

  const femaleMin = d3.min(maleFemaleData, d => d.female);  // 女性比例的最小值
  const maleMax = d3.max(maleFemaleData, d => d.male);  // 男性比例的最大值
  // 右侧 y 轴比例尺 - 表示男或女占总人数比例
  const yRight = d3.scaleLinear()
    .domain([0.45, 0.55])
    .range([height * 0.4, 0]);  // 将 height 改为 height * 0.4，这样折线图只占用上面40%的空间


  const color = d3.scaleOrdinal()
    .domain(["儿童", "成年", "老年"])
    .range(["#abdda4", "#fee08b", "rgba(138, 35, 9, 0.42)"]);
  const svg1 = d3.select('#ageshow-container svg');
  // 如果存在则移除
  if (!svg1.empty()) {
    svg1.remove();
  }

  const svg = d3.select('#ageshow-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // 绘制堆叠柱状图
  const layers = svg.selectAll('.layer')
    .data(d3.stack().keys(d3.range(n))(yz))
    .enter().append('g')
    .attr('class', 'layer')
    .style('fill', (d, i) => color(Object.keys(color.domain())[i]));

  const bars = layers.selectAll('rect')
    .data(d => d)
    .enter().append('rect')
    .attr('x', (d, i) => x(years[i]))
    .attr('y', d => yLeft(d[1]))
    .attr('height', d => yLeft(d[0]) - yLeft(d[1]))
    .attr('width', x.bandwidth());



  // 2. 创建折线生成器

  const lineMale = d3.line()
    .x(d => x(d.year) + x.bandwidth() / 2)  // 将折线的 x 值设置在每个柱子的中间
    .y(d => yRight(d.male));  // 使用全局最大值来调整 y 坐标

  const lineFemale = d3.line()
    .x(d => x(d.year) + x.bandwidth() / 2)  // 将折线的 x 值设置在每个柱子的中间
    .y(d => yRight(d.female));  // 使用全局最大值来调整 y 坐标

  // 3. 绘制两条折线

  svg.append('path')
    .data([maleFemaleData])
    .attr('class', 'line-male')
    .attr('d', lineMale)
    .style('fill', 'none')
    .style('stroke', '#3288bd')  // 蓝色
    .style('stroke-width', 2);


  svg.selectAll('.dot-male')
    .data(maleFemaleData)
    .enter().append('circle')
    .attr('class', 'dot-male')
    .attr('cx', d => x(d.year) + x.bandwidth() / 2)
    .attr('cy', d => yRight(d.male))
    .attr('r', 3)
    .style('fill', '#3288bd')
    .on("mouseover", function (event, d) {
      tooltip.html(tooltipContent(province, d.year, (d.male * 100).toFixed(2) + '%', '男性比例'))
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .style('opacity', 1);
    })
    .on("mouseout", function () {
      tooltip.style('opacity', 0);
    });

  svg.append('path')
    .data([maleFemaleData])
    .attr('class', 'line-female')
    .attr('d', lineFemale)
    .style('fill', 'none')
    .style('stroke', "#ee7989")  // 粉色
    .style('stroke-width', 2);

  svg.selectAll('.dot-female')
    .data(maleFemaleData)
    .enter().append('circle')
    .attr('class', 'dot-female')
    .attr('cx', d => x(d.year) + x.bandwidth() / 2)
    .attr('cy', d => yRight(d.female))
    .attr('r', 3)
    .style('fill', "#ee7989")
    .on("mouseover", function (event, d) {
      tooltip.html(tooltipContent(province, d.year, (d.female * 100).toFixed(2) + '%', '女性比例'))
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px')
        .style('opacity', 1);
    })
    .on("mouseout", function () {
      tooltip.style('opacity', 0);
    });

  // 添加坐标轴
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  // 左侧 y 轴 - 表示男女总人数
  svg.append('g')
    .attr('class', 'y-axis-left')
    .transition()    // 添加过渡
    .duration(750)   // 设置动画时长
    .ease(d3.easeElastic)  // 使用线性过渡效果
    .call(d3.axisLeft(yLeft));

  // 右侧 y 轴 - 表示男女所占总人数比例
  svg.append('g')
    .attr('class', 'y-axis-right')
    .attr('transform', `translate(${width}, 0)`)
    .call(d3.axisRight(yRight).tickFormat(d3.format('.0%')));



  // 添加男女折线颜色图例
  const lineLegend = svg.append('g')
    .attr('class', 'line-legend')
    .attr('transform', `translate(${width + 40}, ${60})`);  // 向下偏移 60，距离原图例下方

  // 男性折线颜色图例
  lineLegend.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 20)
    .attr('y2', 0)
    .style('stroke', '#3288bd')  // 蓝色表示男性
    .style('stroke-width', 2);

  // 女性折线颜色图例
  lineLegend.append('line')
    .attr('x1', 0)
    .attr('y1', 15)
    .attr('x2', 20)
    .attr('y2', 15)
    .style('stroke', "#ee7989")  // 粉色表示女性
    .style('stroke-width', 2);

  // 添加图例标签
  lineLegend.selectAll('text')
    .data(['男性', '女性'])
    .enter().append('text')
    .attr('x', 24)
    .attr('y', (d, i) => i * 20)  // 调整文字位置，避免重叠
    .text(d => d)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  // 添加图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 40}, 200)`);

  // 添加儿童、成年、老年图例
  legend.selectAll('rect')
    .data(["0-14", "15-64", "65+"])
    .enter().append('rect')
    .attr('y', (d, i) => i * 20)
    .attr('width', 12)
    .attr('height', 12)
    .style('fill', d => color(d));

  legend.selectAll('text')
    .data(["0-14", "15-64", "65+"])
    .enter().append('text')
    .attr('x', 24)
    .attr('y', (d, i) => i * 20 + 9)
    .text(d => d)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  // 实现布局切换动画
  function transitionGrouped() {
    // 更新y轴比例尺到百分比范围
    yLeft.domain([0, 1]);

    bars.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('x', function (d, i) {
        const layerIndex = this.parentNode.__data__.index;
        return x(years[i]) + (x.bandwidth() / n) * layerIndex;
      })
      .attr('width', x.bandwidth() / n)
      .transition()
      .attr('y', d => yLeft(d[1] - d[0]))
      .attr('height', d => height - yLeft(d[1] - d[0]));

    // 更新y轴标签为百分比格式
    svg.select('.y-axis-left')
      .transition()
      .duration(500)
      .call(d3.axisLeft(yLeft).tickFormat(d3.format('.0%')));
  }

  // 修改transitionStacked函数
  function transitionStacked() {
    // 更新y轴比例尺到原始数值范围
    yLeft.domain([0, totalPopulation * 1.1]);

    bars.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('y', d => yLeft(d[1]))
      .attr('height', d => yLeft(d[0]) - yLeft(d[1]))
      .transition()
      .attr("x", (d, i) => x(years[i]))
      .attr("width", x.bandwidth())
      .ease(d3.easeCubicOut);

    // 更新y轴标签为原始数值格式
    svg.select('.y-axis-left')
      .transition()
      .duration(500)
      .call(d3.axisLeft(yLeft));
  }




  // 根据当前布局执行相应的过渡
  if (layout === "grouped") {
    transitionGrouped();
  } else {
    transitionStacked();
  }
}


// 监听省份选择事件
document.addEventListener('provinceSelected', (event) => {
  const province = event.detail.province;
  selectedProvince = province || '全国'; // 如果没有选择省份，则显示全国数据
  updateChart(selectedProvince, selectedLayout);

   // 更新按钮可用性
   const radios = document.querySelectorAll('input[name="layout"]');
   radios.forEach(radio => {
     if (radio.value === 'stacked') {
       if (selectedProvince === '全国') {
         radio.disabled = true;
         radio.parentElement.style.opacity = '0.6';
         // 如果当前选中了 'stacked'，切换为 'grouped'
         if (radio.checked) {
           radios.forEach(r => {
             if (r.value === 'grouped') {
               r.checked = true;
               selectedLayout = 'grouped';
             }
           });
         }
       } else {
         radio.disabled = false;
         radio.parentElement.style.opacity = '1';
       }
     }
   });
});
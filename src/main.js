import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './china.geo.json';

// 导入CSV数据
const allPeopleData = new URL('./assets/allpeople.csv', import.meta.url).href;
const birthRateData = new URL('./assets/birthrateProvince.csv', import.meta.url).href;
const genderRatioData = new URL('./assets/malefemale.csv', import.meta.url).href;
const migrationData = new URL('./assets/migration.csv', import.meta.url).href;

let selectedProvince = null;
// 在文件顶部声明全局变量
let currentDataMap;
let currentColorScale;

const width = 800;
const height = 500;

const projection = d3.geoMercator()
  .center([105, 35])
  .scale(570)
  .translate([width / 2 - 10, height / 2 + 20]);

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);

const svg = d3.select('#map-container').append('svg')
  .attr('viewBox', [0, 0, width, height])
  .attr('width', width)
  .attr('height', height)
  .attr('style', 'max-width: 100%; height: auto;')
  .on('click', reset); // 确保绑定了点击事件

// 在 svg 定义之后添加图例容器
const legend = svg.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(20, 50)`); // 放置在左侧


const path = d3.geoPath().projection(projection);

const g = svg.append('g');

// 数据处理中，统一省份名称
function normalizeProvinceName(name) {
  return name.replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区/g, '');
}

Promise.all([
  d3.csv(allPeopleData),
  d3.csv(birthRateData),
  d3.csv(genderRatioData),
  d3.csv(migrationData)
]).then(([allPeople, birthRate, genderRatio,migration]) => {
  // 创建数据映射
  const allPeopleMap = new Map();
  allPeople.forEach(d => {
    const province = normalizeProvinceName(d['地区']);
    allPeopleMap.set(province, +d['2023']);
  });

  const birthRateMap = new Map();
  birthRate.forEach(d => {
    const province = normalizeProvinceName(d['地区']);
    birthRateMap.set(province, +d['2022年']);
  });

  const genderRatioMap = new Map();
  genderRatio.forEach(d => {
    const province = normalizeProvinceName(d['地区']);
    genderRatioMap.set(province, +d['2023']);
  });

  const migrationMap = new Map();
migration.forEach(d => {
  const province = normalizeProvinceName(d['地区']);
  // 计算各地区迁出人数之和
  const totalMigration = ['华北', '东北', '华东', '中南', '西南', '西北']
    .reduce((sum, region) => sum + (+d[region]), 0);
    
  // 获取该省份的总人口（单位：万人）
  const totalPopulation = allPeopleMap.get(province);
  
  // 计算迁出人数占总人口的比例 (‰)
  // 由于迁出人数是具体人数，总人口是万人，需要进行单位转换
  const migrationRate = totalPopulation ? (totalMigration / (totalPopulation * 10000)) * 1000 : 0;
  
  migrationMap.set(province, migrationRate);
});

  // 定义颜色比例尺
  const allPeopleColor = d3.scaleSequential(d3.interpolateBlues)
    .domain([2000, 12000]);

  const birthRateColor = d3.scaleSequential(d3.interpolateReds)
    .domain([3, 15]);

  const genderRatioColor = d3.scaleSequential(d3.interpolateGreens)
    .domain([95, 120]);

    const migrationColor = d3.scaleSequential(d3.interpolatePurples)
  .domain([0, d3.max([...migrationMap.values()])]);


  // 默认使用总人数映射
  currentDataMap = birthRateMap;
  currentColorScale = birthRateColor;

  const states = g.append('g')
    .attr('fill', '#444')
    .attr('cursor', 'pointer')
    .selectAll('path')
    .data(us.features)
    .enter().append('path')
    .attr('d', path)
    .on('click', clicked)
    .attr('fill', d => {
      const province = normalizeProvinceName(d.properties.name);
      const value = currentDataMap.get(province);
      return value ? currentColorScale(value) : '#ccc';
    });

  states.append('title')
    .text(d => {
      const province = normalizeProvinceName(d.properties.name);
      return `${d.properties.name}: ${currentDataMap.get(province) || '无数据'}`;
    });

  // 绘制边界线
  g.append('path')
    .attr('fill', 'none')
    .attr('stroke', 'white')
    .attr('stroke-linejoin', 'round')
    .attr('d', path(topojson.mesh(us, us.features, (a, b) => a !== b)));

  svg.call(zoom);

  // 在controls-container中添加按钮
  const controlsContainer = d3.select('#controls-container');
  controlsContainer
  controlsContainer
    .style('display', 'flex')
    .style('flex-direction', 'column')  // 确保垂直排列
    .style('gap', '10px')              // 设置间距
    .style('margin', '20px')           // 调整外边距
    .style('position', 'relative')
    .style('width', 'fit-content');    // 确保容器宽度适应内容



  // 定义按钮的初始样式
  const buttonStyles = {
    'display': 'flex',
    'align-items': 'center',
    'padding': '8px 15px',
    'border': '2px solid #e0e0e0',
    'border-radius': '6px',
    'cursor': 'pointer',
    'font-size': '14px',
    'font-weight': '500',
    'background-color': '#ffffff',
    'color': '#555',
    'transition': 'all 0.2s ease',
    'box-shadow': '0 2px 4px rgba(0,0,0,0.05)',
    'user-select': 'none',
    'width': '100px',  // 添加固定宽度
    'justify-content': 'center' // 文字居中
  };


  const buttons = [
    {
      id: 'totalPopulationBtn',
      text: '按照总人数映射',
      onClick: () => {
        currentDataMap = allPeopleMap;
        currentColorScale = allPeopleColor;
        updateMap();
      }
    },
    {
      id: 'birthRateBtn',
      text: '按照出生率映射',
      onClick: () => {
        currentDataMap = birthRateMap;
        currentColorScale = birthRateColor;
        updateMap();
      }
    },
    {
      id: 'genderRatioBtn',
      text: '按照男女比例映射',
      onClick: () => {
        currentDataMap = genderRatioMap;
        currentColorScale = genderRatioColor;
        updateMap();
      }
    },
    {
      id: 'migrationBtn',
      text: '按照迁出率映射',
      onClick: () => {
        currentDataMap = migrationMap;
        currentColorScale = migrationColor;
        updateMap();
      }
    }
  ];


  function createLegend(scale, title) {
    // 清除现有图例
    legend.selectAll('*').remove();
    
    // 创建渐变矩形
    const height = 380;
    const width = 20;
    
    // 添加标题
    legend.append('text')
      .attr('class', 'legend-title')
      .attr('x', 0)
      .attr('y', -10)
      .style('font-size', '12px')
      .text(title);
  
    // 创建颜色条
    const legendScale = d3.scaleLinear()
      .domain(scale.domain())
      .range([0, height]);
  
    // 添加矩形渐变
    const numStops = 20;
    const dataPoints = d3.range(numStops).map(i => 
      scale.domain()[0] + (i / (numStops-1)) * (scale.domain()[1] - scale.domain()[0])
    );
  
    legend.selectAll('rect')
      .data(dataPoints)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => (i * (height / numStops)))
      .attr('width', width)
      .attr('height', height / numStops + 1)
      .style('fill', d => scale(d));
  
    // 添加刻度
    const axis = d3.axisRight(legendScale)
      .ticks(5);
  
    legend.append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(axis);
  }

  // 创建按钮并应用样式和事件
  buttons.forEach(buttonInfo => {
    const button = controlsContainer.append('button')
      .attr('id', buttonInfo.id)
      .text(buttonInfo.text)
      .on('click', function () {
        // 重置所有按钮样式
        controlsContainer.selectAll('button')
          .style('background-color', '#ffffff')
          .style('border-color', '#e0e0e0')
          .style('color', '#555')
          .classed('active', false);

        // 设置当前按钮的选中样式
        d3.select(this)
          .style('background-color', '#f0f7ff')
          .style('border-color', '#3288bd')
          .style('color', '#3288bd')
          .classed('active', true);

            // 更新图例
      if (buttonInfo.id === 'totalPopulationBtn') {
        createLegend(allPeopleColor, '总人口 (万人)');
      } else if (buttonInfo.id === 'birthRateBtn') {
        createLegend(birthRateColor, '出生率 (‰)');
      } else if (buttonInfo.id === 'genderRatioBtn') {
        createLegend(genderRatioColor, '性别比');
      }else if (buttonInfo.id === 'migrationBtn') {
        createLegend(migrationColor, '迁出率 (‰)');
      }
        // 执行按钮的点击事件
        buttonInfo.onClick();
      })
      .on('mouseover', function () {
        d3.select(this)
          .style('background-color', '#f0f0f0')
          .style('border-color', '#ccc');
      })
      .on('mouseout', function () {
        if (!d3.select(this).classed('active')) {
          d3.select(this)
            .style('background-color', '#ffffff')
            .style('border-color', '#e0e0e0')
            .style('color', '#555');
        }
      });

    // 应用初始样式
    Object.entries(buttonStyles).forEach(([key, value]) => {
      button.style(key, value);
    });
  });
  
// 初始化默认图例(出生率)
createLegend(birthRateColor, '出生率 (‰)');

  // 设置默认选中的按钮（例如，第一个按钮）
  controlsContainer.select('#birthRateBtn')
    .classed('active', true)
    .style('background-color', '#f0f7ff')
    .style('border-color', '#3288bd')
    .style('color', '#3288bd');

  function updateMap() {
    states.transition()
      .duration(500)
      .attr('fill', d => {
        const province = normalizeProvinceName(d.properties.name);
        const value = currentDataMap.get(province);
        return value ? currentColorScale(value) : '#ccc';
      });

    states.select('title')
      .text(d => {
        const province = normalizeProvinceName(d.properties.name);
        return `${d.properties.name}: ${currentDataMap.get(province) || '无数据'}`;
      });
  }

  function clicked(event, d) {
    event.stopPropagation();
 // 隐藏图例，添加过渡效果
 legend.transition()
 .duration(750)
 .style('opacity', 0)
 .on('end', function() {
     legend.style('display', 'none');
 });

    // 如果之前有选中的省份，恢复其颜色
    if (selectedProvince) {
      selectedProvince
        .attr('fill', d => {
          const provinceName = normalizeProvinceName(selectedProvince.datum().properties.name);
          const value = currentDataMap.get(provinceName);
          return value ? currentColorScale(value) : '#ccc';
        })
        .attr('stroke', null)  // 移除描边
            .attr('stroke-width', null);
        ;
    }

    // 将当前点击的省份设为选中的省份，并修改其颜色为灰色
    selectedProvince = d3.select(this);
    selectedProvince.attr('stroke', '#FFD700')  // 添加白色描边
      .attr('stroke-width', '2px');  // 设置描边宽度

    const [[x0, y0], [x1, y1]] = path.bounds(d);
    // 触发自定义事件，传递所选省份名称
    const customEvent = new CustomEvent('provinceSelected', {
      detail: { province: d.properties.name }
    });
    document.dispatchEvent(customEvent);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(5, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
    );
  }
});



function zoomed(event) {
  const { transform } = event;
  g.attr('transform', transform);
  g.attr('stroke-width', 1 / transform.k);
}
function reset(event) {
  event.stopPropagation();

  // 显示图例，添加过渡效果
  legend.style('display', 'block')
  .transition()
  .duration(750)
  .style('opacity', 1);

  // 如果有选中的省份，恢复其颜色
  if (selectedProvince) {
    selectedProvince
      .attr('fill', d => {
        const provinceName = normalizeProvinceName(selectedProvince.datum().properties.name);
        const value = currentDataMap.get(provinceName);
        return value ? currentColorScale(value) : '#ccc';
      })
      .attr('stroke', null)  // 移除描边
            .attr('stroke-width', null);
        ;
    selectedProvince = null;
    // 触发重置事件，传递 null 表示没有省份被选中
    const customEvent = new CustomEvent('provinceSelected', {
      detail: { province: null }
    });
    document.dispatchEvent(customEvent);
  }
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  );

}
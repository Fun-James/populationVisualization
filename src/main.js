import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './china.geo.json';

// 导入CSV数据
const allPeopleData = new URL('./assets/allpeople.csv', import.meta.url).href;
const birthRateData = new URL('./assets/birthrateProvince.csv', import.meta.url).href;
const genderRatioData = new URL('./assets/malefemale.csv', import.meta.url).href;

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

const path = d3.geoPath().projection(projection);

const g = svg.append('g');

// 数据处理中，统一省份名称
function normalizeProvinceName(name) {
  return name.replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区/g, '');
}

Promise.all([
  d3.csv(allPeopleData),
  d3.csv(birthRateData),
  d3.csv(genderRatioData)
]).then(([allPeople, birthRate, genderRatio]) => {
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

  // 定义颜色比例尺
  const allPeopleColor = d3.scaleSequential(d3.interpolateBlues)
    .domain([2000, 12000]);

  const birthRateColor = d3.scaleSequential(d3.interpolateReds)
    .domain([3, 15]);

  const genderRatioColor = d3.scaleSequential(d3.interpolateGreens)
    .domain([95, 120]);

  // 默认使用总人数映射
  let currentDataMap = birthRateMap;
  let currentColorScale = birthRateColor;

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
  .style('gap', '20px')              // 设置间距
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
  }
];

// 创建按钮并应用样式和事件
buttons.forEach(buttonInfo => {
  const button = controlsContainer.append('button')
    .attr('id', buttonInfo.id)
    .text(buttonInfo.text)
    .on('click', function() {
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
      
      // 执行按钮的点击事件
      buttonInfo.onClick();
    })
    .on('mouseover', function() {
      d3.select(this)
        .style('background-color', '#f0f0f0')
        .style('border-color', '#ccc');
    })
    .on('mouseout', function() {
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
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  );
}
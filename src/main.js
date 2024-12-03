import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import us from './china.geo.json';

const width = 800;
const height = 500;

const projection = d3.geoMercator()
  .center([105, 35]) // 设置地图中心点经纬度
  .scale(570) // 设置缩放比例
  .translate([width / 2 - 10, height / 2 + 20]); // 设置平移


const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);

const svg = d3.select('#map-container').append('svg')
  .attr('viewBox', [0, 0, width, height])
  .attr('width', width)
  .attr('height', height)
  .attr('style', 'max-width: 100%; height: auto;')
  .on('click', reset);

const path = d3.geoPath().projection(projection);

const g = svg.append('g');

const states = g.append('g')
  .attr('fill', '#444')
  .attr('cursor', 'pointer')
  .selectAll('path')
  .data(us.features)  // 使用导入的 us 数据
  .enter().append('path')
  .on('click', clicked)
  .attr('d', path);

states.append("title")
  .text(d => d.properties.name);

// 绘制边界线
g.append("path")
  .attr("fill", "none")
  .attr("stroke", "white")
  .attr("stroke-linejoin", "round")
  .attr("d", path(topojson.mesh(us, us.features, (a, b) => a !== b)));

svg.call(zoom);

function reset() {
  states.transition().style("fill", null);

  // 这里已经触发了重置事件
  const customEvent = new CustomEvent('provinceSelected', {
    detail: { province: null }
  });
  document.dispatchEvent(customEvent);
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity,
    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  );
}

function clicked(event, d) {
  const [[x0, y0], [x1, y1]] = path.bounds(d);
  event.stopPropagation();
  states.transition().style("fill", null);
  d3.select(this).transition().style("fill", "red");
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
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
    d3.pointer(event, svg.node())
  );
}

function zoomed(event) {
  const { transform } = event;
  g.attr("transform", transform);
  g.attr("stroke-width", 1 / transform.k);
}

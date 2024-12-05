import * as d3 from 'd3';

let combinedData = [];
let selectedProvince = "北京市";
let selectedLayout = "stacked";

function createRadioButton() {
  const container = document.getElementById('ageshow-container');

  const buttonContainer = document.createElement('div');
  buttonContainer.style.position = 'relative';
  buttonContainer.style.marginBottom = '10px';
  buttonContainer.style.textAlign = 'left';
  buttonContainer.style.marginLeft = '60px';
  buttonContainer.style.marginTop = '10px';

  const form = document.createElement('form');
  const options = ["Stacked", "Grouped"];

  options.forEach((label) => {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'layout';
    radio.value = label.toLowerCase();
    radio.style.marginRight = '5px';
    if (label === "Stacked") radio.checked = true;

    const radioLabel = document.createElement('label');
    radioLabel.textContent = label;
    radioLabel.style.marginRight = '15px';
    radioLabel.style.fontSize = '14px';
    radioLabel.insertBefore(radio, radioLabel.firstChild);

    form.appendChild(radioLabel);
  });

  buttonContainer.appendChild(form);
  container.insertBefore(buttonContainer, container.firstChild);

  form.addEventListener('change', (event) => {
    selectedLayout = event.target.value;
    updateChart(selectedProvince, selectedLayout);
  });
}

const csvurl1 = new URL('./assets/child.csv', import.meta.url).href;
const csvurl2 = new URL('./assets/adult.csv', import.meta.url).href;
const csvurl3 = new URL('./assets/elder.csv', import.meta.url).href;

const loadData = () => {
  return Promise.all([
    d3.csv(csvurl1),
    d3.csv(csvurl2),
    d3.csv(csvurl3)
  ]);
};

loadData().then(([data1, data2, data3]) => {
  data1.forEach((item, index) => {
    const province = item['地区'];
    const years = Object.keys(item).slice(1);
    years.forEach(year => {
      combinedData.push({
        province: province,
        year: year,
        child: +item[year],
        adult: +data2[index][year],
        elder: +data3[index][year]
      });
    });
  });
console.log(combinedData);

  createRadioButton();
  updateChart(selectedProvince, selectedLayout);

  window.addEventListener('resize', () => {
    updateChart(selectedProvince, selectedLayout);
  });
}).catch(error => {
  console.error('读取 CSV 文件失败：', error);
});

function updateChart(province, layout = "stacked") {
  const container = document.getElementById('ageshow-container');
  const containerRect = container.getBoundingClientRect();

  const margin = { top: 40, right: 100, bottom: 40, left: 60 };
  const width = Math.max(300, containerRect.width - margin.left - margin.right);
  const height = Math.max(200, containerRect.height - margin.top - margin.bottom - 40);

  const data = combinedData.filter(d => d.province === province);
  if (data.length === 0) return;

  const years = data.map(d => d.year);
  const yz = data.map(d => [d.child, d.adult, d.elder]);
  const n = 3;

  const yStackMax = d3.max(yz, y => d3.sum(y));
  const yGroupMax = d3.max(yz, y => d3.max(y));

  const x = d3.scaleBand()
    .domain(years)
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(["儿童", "成年", "老年"])
    .range(["#66c2a5", "#fc8d62", "#8da0cb"]);

  d3.select('#ageshow-container svg').remove();

  const svg = d3.select('#ageshow-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const layers = svg.selectAll('.layer')
    .data(d3.stack().keys(d3.range(n))(yz))
    .enter().append('g')
    .attr('class', 'layer')
    .style('fill', (d, i) => color(Object.keys(color.domain())[i]));

    const bars = layers.selectAll('rect')
    .data(d => d)
    .enter().append('rect')
    .attr('x', (d, i) => x(years[i]))
    .attr('y', d => y(d[1]))
    .attr('height', d => {
      const height = y(d[0]) - y(d[1]);
      return isNaN(height) ? 0 : height;
    })
    .attr('width', x.bandwidth());

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => d.slice(2)));

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y).tickFormat(d3.format('.0%')));

  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 10}, 0)`);

  legend.selectAll('rect')
    .data(["儿童", "成年", "老年"])
    .enter().append('rect')
    .attr('y', (d, i) => i * 20)
    .attr('width', 12)
    .attr('height', 12)
    .style('fill', d => color(d));

  legend.selectAll('text')
    .data(["儿童", "成年", "老年"])
    .enter().append('text')
    .attr('x', 24)
    .attr('y', (d, i) => i * 20 + 9)
    .text(d => d)
    .style('font-size', '12px')
    .attr('alignment-baseline', 'middle');

  function transitionGrouped() {
    bars.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('x', function (d, i) {
        const layerIndex = this.parentNode.__data__.index;
        return x(years[i]) + (x.bandwidth() / n) * layerIndex;
      })
      .attr('width', x.bandwidth() / n)
      .transition()
      .attr('y', d => y(d[1] - d[0]))
      .attr('height', d => height - y(d[1] - d[0]));
  }

  function transitionStacked() {
    y.domain([0, yStackMax]);

    bars.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .attr('x', (d, i) => x(years[i]))
      .attr('width', x.bandwidth())
      .transition()
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]));

    svg.select('.y-axis')
      .transition()
      .duration(500)
      .call(d3.axisLeft(y).tickFormat(d3.format('.0%')));
  }

  if (layout === "grouped") {
    transitionGrouped();
  } else {
    transitionStacked();
  }
}

document.addEventListener('provinceSelected', (event) => {
  selectedProvince = event.detail.province;
  updateChart(selectedProvince, selectedLayout);
});
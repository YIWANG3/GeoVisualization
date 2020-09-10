import $ from 'jquery';
import ThreeMapLightBar from './ThreeMapLightBar';

const flyDatas = [
    {source: {name: 'Alabama'}, target: {name: 'Arizona'}},
    {source: {name: 'Alaska'}, target: {name: 'Arizona'}},
    {source: {name: 'Arkansas'}, target: {name: 'Alaska'}},
    {source: {name: 'California'}, target: {name: 'Alabama'}},
    {source: {name: 'Alaska'}, target: {name: 'California'}},
    {source: {name: 'California'}, target: {name: 'Colorado'}},
    {source: {name: 'California'}, target: {name: 'Connecticut'}},
    {source: {name: 'Alaska'}, target: {name: 'Connecticut'}},
    {source: {name: 'Delaware'}, target: {name: 'California'}},
    {source: {name: 'Delaware'}, target: {name: 'Arkansas'}},
    {source: {name: 'Colorado'}, target: {name: 'Arkansas'}},
    {source: {name: 'District of Columbia'}, target: {name: 'California'}},
    {source: {name: 'District of Columbia'}, target: {name: 'Connecticut'}},
    {source: {name: 'District of Columbia'}, target: {name: 'Alabama'}},
    {source: {name: 'District of Columbia'}, target: {name: 'Alaska'}},
    {source: {name: 'Florida'}, target: {name: 'California'}},
    {source: {name: 'Florida'}, target: {name: 'Arizona'}},
    {source: {name: 'Florida'}, target: {name: 'Colorado'}},
    {source: {name: 'Florida'}, target: {name: 'Connecticut'}},
    {source: {name: 'Georgia'}, target: {name: 'Connecticut'}},
    {source: {name: 'Georgia'}, target: {name: 'California'}},
    {source: {name: 'Georgia'}, target: {name: 'Alabama'}},
    {source: {name: 'Hawaii'}, target: {name: 'California'}},
    {source: {name: 'Hawaii'}, target: {name: 'Alabama'}},
    {source: {name: 'Idaho'}, target: {name: 'Georgia'}},
    {source: {name: 'Idaho'}, target: {name: 'California'}},
    {source: {name: 'Idaho'}, target: {name: 'Arkansas'}},
    {source: {name: 'Illinois'}, target: {name: 'California'}},
    {source: {name: 'Illinois'}, target: {name: 'Colorado'}},
];

const buildLightBarData = function (flyData) {
    let dict = {};
    for (let data of flyData) {
        dict[data.source.name] = 0;
        dict[data.target.name] = 0;
    }

    for (let data of flyData) {
        dict[data.source.name]++;
        dict[data.target.name]++;
    }

    let res = [];
    for (let key in dict) {
        res.push({name: key, value: dict[key] * 50});
    }
    return res;
};

let lightBarData = buildLightBarData(flyDatas);


$.get('/map/us-states.json', data => {
    const map = new ThreeMapLightBar(data);
    map.drawLightBar(lightBarData);
    map.drawFlyLine(flyDatas);
});

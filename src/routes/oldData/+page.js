'Data Source: https://www.kaggle.com/datasets/lucaspoo/germany-cars?resource=download';

import Papa from 'papaparse';
import { base } from '$app/paths';

function processData(cleanData, rawData) {
	for (let i = 0; i < rawData.length; i++) {
		cleanData.push({
			gameID: rawData[i].gameID,
			categoryID: rawData[i].categoryID,
			levelID: rawData[i].levelID,
			date: rawData[i].date,
			primaryTime: rawData[i].primaryTime,
			platform: rawData[i].platform
		});
	}
	return cleanData;
}

export async function load({ fetch }) {
	var fileName = 'out.csv';

	if (fileName == 'runs-data.csv') {
		const response1 = await fetch(base + '/data/runs-data1.csv', {
			headers: { 'Content-Type': 'text/csv' }
		});

		const csvData1 = await response1.text();
		var parsedData1 = Papa.parse(csvData1, { header: true });

		var cleanData = [];
		cleanData = processData(cleanData, parsedData1.data);
		parsedData1 = null;

		const response2 = await fetch(base + '/data/runs-data2.csv', {
			headers: { 'Content-Type': 'text/csv' }
		});

		const csvData2 = await response2.text();
		var parsedData2 = Papa.parse(csvData2, { header: true });

		cleanData = processData(cleanData, parsedData2.data);
		parsedData2 = null;

		return { data: cleanData };
	} else {
		const response = await fetch(base + '/data/' + fileName, {
			headers: { 'Content-Type': 'text/csv' }
		});

		const csvData = await response.text();
		const parsedData = Papa.parse(csvData, { header: true });

		return { data: parsedData.data };
	}
}

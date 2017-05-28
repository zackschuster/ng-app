export const contacts = [
	{
		name: 'Marvin Lopez',
		email: 'marvin.lopez@tcoe.org',
		phone: '209-298-9927',
		subject: 'Hello!',
		message: 'I want to be a history teacher. I can send credentials if requested. Thanks!',
	},
	{
		name: 'Donna Glassman-Sommer',
		email: 'donna.glassman-sommer@tcoe.org',
		phone: '209-298-9927',
		subject: 'Can I be a teacher?',
		message: `I'm interested in science and math. What's the process to apply?`,
	},
];

export const pieChartOptions = {
	type: 'pie',
	data: {
		labels: ['Tulare', 'Riverside', 'Los Angeles'],
		datasets: [{
			data: [300, 50, 100],
			backgroundColor: ['#5cb85c', '#428bca', '#d9534f'],
			hoverBackgroundColor: ['#5cb85c', '#428bca', '#d9534f'],
		}],
	},
};

export const barChartOptions = {
	type: 'bar',
	data: {
		labels: ['English', 'Math', 'Science', 'History', 'Economics', 'Language'],
		datasets: [{
			label: 'Interests',
			data: [12, 19, 3, 5, 2, 3],
			backgroundColor: [
				'rgba(255, 99, 132, 0.2)',
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 206, 86, 0.2)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(153, 102, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)',
			],
			borderColor: [
				'rgba(255,99,132,1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)',
			],
			borderWidth: 1,
		}],
	},
};

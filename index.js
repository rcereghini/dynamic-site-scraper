const puppeteer = require("puppeteer");
const $ = require("cheerio");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");

const url =
	"https://www.amazon.com/Raspberry-Model-2019-Quad-Bluetooth/dp/B07TC2BK1X?pf_rd_r=EGP8GRPGA2R3C0Z8Z0ND&pf_rd_p=7b7a9b60-b7af-4aff-bee2-c63a2d6a8166&pd_rd_r=6b932a3e-5383-4d0b-a009-458d909088d0&pd_rd_w=e6VDI&pd_rd_wg=GTKCf&ref_=pd_gw_bia_d0";
async function configureBrowser() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);
	return page;
}

async function checkPrice(page) {
	await page.reload();
	let html = await page.evaluate(() => document.body.innerHTML);
	// console.log(html);

	$("#price_inside_buybox", html).each(function() {
		let dollarPrice = $(this).text();
		let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g, ""));
		console.log("currentPrice", currentPrice);
		sendNotification(currentPrice);
		console.log("after send");
	});
}

async function startTracking() {
	const page = await configureBrowser();

	let job = new CronJob(
		"* */30 * * * *",
		function() {
			//runs every 30 minutes in this config
			checkPrice(page);
		},
		null,
		true,
		null,
		null,
		true
	);
	job.start();
}

async function sendNotification(price) {
	console.log("sending notification...");
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "EMAIL",
			pass: "PW",
		},
	});
	console.log("transporter created...");

	let textToSend = "Price dropped to " + price;
	console.log("textToSend =>", textToSend);
	let htmlText = `<p>Link</p>`;
	console.log("htmlText =>", htmlText);
	await transporter.verify(function(error, success) {
		if (error) {
			console.log(error);
		} else {
			console.log("Server is ready to take our messages");
		}
	});
	let info = await transporter.sendMail({
		from: "EMAIL",
		to: "EMAIL",
		subject: "Price dropped to " + price,
		text: textToSend,
		html: htmlText,
	});

	console.log("Message sent: %s", info.messageId);
}

// sendNotification(3);

// startTracking();

// async function monitor() {
// 	let page = await configureBrowser();
// 	await checkPrice(page);
// }

// monitor();

let test = function() {
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "EMAIL",
			pass: "PW",
		},
	});

	let mailOptions = {
		from: "EMAIL",
		to: "EMAIL",
		subject: "Sending Email using Nodemailer",
		text: "That was easy!",
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent " + info.response);
		}
	});
	// res.json({ success: "whatever message you plan on writing" });
};

test();

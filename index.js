const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

////////////////////////////
////////// FILES ///////////
////////////////////////////

// Blocking code - synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// const textOut = `Here is the result: ${textIn}\nCreated on ${new Date(
//   Date.now()
// )}`;

// fs.writeFileSync("./txt/output.txt", textOut);

// Non-blocking asynchronous way
/*
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("All done");
      });
    });
  });
});

console.log("File writing done");
*/

////////////////////////////
////////// SERVER //////////
////////////////////////////

const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const productData = JSON.parse(data);
const tempOverview = fs.readFileSync(
    "./templates/template-overview.html",
    "utf-8"
);
const tempProduct = fs.readFileSync(
    "./templates/template-product.html",
    "utf-8"
);
const tempCard = fs.readFileSync("./templates/template-card.html", "utf-8");

const slugs = productData.map((product) =>
    slugify(product.productName, { lower: true })
);

const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);

    if (pathname === "/" || pathname === "/overview") {
        // OVERVIEW
        const cardsHtml = productData.map((el) =>
            replaceTemplate(tempCard, el)
        );

        const overviewHtml = tempOverview.replace(
            /{%PRODUCT_CARDS%}/g,
            cardsHtml.join("")
        );

        res.writeHead(200, {
            "content-type": "text/html",
        });
        res.end(overviewHtml);
    } else if (pathname === "/product") {
        // PRODUCT
        res.writeHead(200, {
            "content-type": "text/html",
        });

        const requestedProduct = productData.find(
            (product) => product.id === Number(query.id)
        );
        const productHtml = replaceTemplate(tempProduct, requestedProduct);
        res.end(productHtml);
    } else if (pathname === "/api") {
        // API
        res.writeHead(200, {
            "content-type": "application/json",
        });
        res.end(productData);
    } else {
        // NOT-FOUND
        res.writeHead(404, {
            "content-type": "text/html",
            "my-header": "Hello from the header",
        });
        res.end("<h1>Page not found</h1>");
    }
});

// localhost ip address -> 127.0.0.1 --> port address is 7001 here so, localhost:7001 is 127.0.0.1:7001
server.listen(7001, () => {
    console.log("Listening to port 7001");
});

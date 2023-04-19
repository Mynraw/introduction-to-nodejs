import { readFileSync } from 'fs';
import { createServer } from 'http';
import { parse, fileURLToPath } from 'url';
import path from 'path';

// This is how to use dirname if module is enabled and it became ES instead of commonJS (screw 'rEqUiReD')
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Synchronous way (Blocking code)
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// // console.log(textIn);

// const textOut = `${textIn} but we need moarrrr.\nFor instance its date: ${Date.now()}`;

// fs.writeFileSync("./txt/output.txt", textOut, "utf-8");
// console.log("file has written");

// Asynchronous way (Non-blocking code)
// fs.readFile("./txt/start.txt", "utf-8", (error, data) => {
//   error ? console.log(error) : console.log(data);
// });
// console.log("reading..."); // non-blocked. went to the console first!

// Here, callback hell as an intellectual:
// fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
//   if (error) return console.log("ERROR 💣💥"); // returns stops here if there is an error
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
//     error ? console.log(error) : console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (error, data3) => {
//       console.log(data3);
//       fs.writeFile(
//         "./txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         (error) => {
//           error ? console.log(error) : console.log("successfully written");
//         }
//       );
//     });
//   });
// });
// console.log("reading...");

////////////////////////////////////////////////////////////////////////
// SERVER
const replaceTemplate = (temp, product) => {
  // Instead of mutating parameters, create a variable, assign the values and make mutations there.
  let output = temp.replace(/{%PRODUCT_NAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

  return output;
};

// Read and write API and other pages once at the beginning
// !!! MAKE IT SYNC (BLOCKED) THIS TIME. runs just once.
// Otherwise, if they were being called on async block, they'd be called whenever it's called.
const tempOverview = readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempProduct = readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const tempCard = readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

const data = readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);

const server = createServer((req, res) => {
  // console.log(url.parse(req.url));
  // /product -> pathname
  // ?id=0 -> search
  // id=0 -> query

  // Destructured from the req.
  const { query, pathname } = parse(req.url, true);

  // Routing
  // const pathName = req.url; // won't be needed anymore. destructured the same

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = productData
      .map((product) => replaceTemplate(tempCard, product))
      .join('');

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    // As we don't need any iteration here, just get the specific product via it's id.
    const product = productData[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    // fs.readFile(`${__dirname}/dev-data/data.json`, "utf-8", (error, data) => {
    //   res.writeHead(200, { "Content-type": "application/json" });
    //   res.end(data);
    /*
      * With this way, whenever api endpoint is called, it reads and writes over and over.
        To prevent this, call the file once at the top, call here and so on.
      */
    // });
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not found page
  } else {
    // !!! head should be declared before end.
    res.writeHead(404, {
      'Content-type': 'text/html',
      'custom-header': 'go-brrrrr',
    }); // Can be seen on devTools -> network
    res.end('<h1>Page is not found.</h1>');
  }
});

const port = 3000;
const host = '127.0.0.1';

server.listen(port, host, () => {
  console.log(`server is listening on port ${port}`);
});

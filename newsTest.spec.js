const { By, Builder, Browser } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const { get } = require("http");
const filePath = path.join(__dirname, "newsData.json");

async function getArticleContent(driver, link) {
  // open the article link
  await driver.get(link);
  // find the article content
  let paragraphs = await driver.findElements(By.css(".blog-item-content p"));
  let articleContent = await Promise.all(
    paragraphs.map(async (p) => await p.getText())
  );
  // Navigate back to the news list page
  await driver.navigate().back();
  return {
    content: articleContent.join("\n"),
  };
}

async function getNewsData() {
  let driver = await new Builder().forBrowser(Browser.CHROME).build();
  let newsData = [];
  try {
    // set the url
    const url = "https://kopikenangan.com/news";
    // navigate to the url
    await driver.get(url);
    // get blog-list-pagination element
    const paginationElement = await driver.findElement(
      By.className("blog-list-pagination")
    );
    // scroll to the pagination element to make all news visible
    await driver.actions().scroll(0, 0, 0, 0, paginationElement).perform();
    // get all news cards elements
    const newsCards = await driver.findElements(By.css(".blog-item"));
    // loop through each news card
    for (let i = 0; i < newsCards.length; i++) {
      const card = newsCards[i];
      const article = {};
      // get title element
      const titleElement = await card.findElement(By.css(".blog-title a"));
      article.title = await titleElement.getText();
      article.link = await titleElement.getAttribute("href");
      // get date element
      const dateElement = await card.findElement(
        By.css(".blog-meta-secondary")
      );
      article.date = await dateElement.getText();
      // get author element
      const authorElement = await card.findElement(By.className("blog-author"));
      article.author = await authorElement.getAttribute("innerHTML");
      // get image element
      const imageElement = await card.findElement(By.css(".image-wrapper img"));
      article.imageUrl = await imageElement.getAttribute("src");
      // push article data to the array
      newsData.push(article);
    }
    // iterate through each article link to get content
    for (let news of newsData) {
      let newsContent = await getArticleContent(driver, news.link);
      news.content = newsContent.content;
    }
    // write the news data to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));
  } catch (error) {
    console.log(error);
  } finally {
    await driver.quit();
  }
}

getNewsData()
  .then(() => {
    console.log("News data fetched successfully.");
  })
  .catch((error) => {
    console.error("Error fetching news data:", error);
  });

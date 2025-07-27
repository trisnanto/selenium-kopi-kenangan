const { By, Builder, Browser } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");
const { get } = require("http");
const filePath = path.join(__dirname, "elementsWithIds.json");

async function getElements() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    // navigate to the url
    await driver.get("https://kopikenangan.com");
    // find elements that contain id attribute
    const elements = await driver.findElements(By.css("[id]"));
    // map the elements to their id attributes
    const ids = await Promise.all(
      elements.map(async (element) => {
        try {
          let tagName = await element.getTagName();
          let id = await element.getAttribute("id");
          // return the id attribute of the element
          return {
            tagName: tagName,
            id: id,
          };
        } catch (error) {
          console.log("Error processing element:", error.message);
          return null; // Return null for failed elements
        }
      })
    );
    // Filter out null values (failed elements)
    const validIds = ids.filter((item) => item !== null);
    // write the elements ids to a JSON file
    fs.writeFileSync(filePath, JSON.stringify(validIds, null, 2));
  } catch (error) {
    console.log(error);
  } finally {
    await driver.quit();
  }
}

getElements()
  .then(() => console.log("Elements fetched successfully"))
  .catch((error) => console.error("Error fetching elements:", error));

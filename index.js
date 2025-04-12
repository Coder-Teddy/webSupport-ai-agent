import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import OpenAI from "openai";
import { ChromaClient } from "chromadb";

const chromaClient = new ChromaClient({ path: "http://localhost:8000" });
chromaClient.heartbeat().then(() => console.log("Connected to ChromaDB"));

const SCRAP_DATA_COLLECTION = "SCRAP_DATA_COLLECTION";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const urls = [
    // add your web urls
  ];

async function webScrapping(url = "") {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $("script, style").remove();

    const body = $("body").text().replace(/\s+/g, " ").trim();
    return { body };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { body: "" };
  }
}

async function createVectorEmbed({ text }) {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    return embedding.data[0].embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}

async function insertToDb({ embedding, url, body }) {
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: SCRAP_DATA_COLLECTION,
    });

    await collection.add({
      ids: [url],
      embeddings: [embedding],
      metadatas: [{ url, body }],
    });

    console.log(`Successfully inserted: ${url}`);
  } catch (error) {
    console.error("Error inserting to DB:", error);
    throw error;
  }
}

function textChunks(text, chunkSize = 1000) {
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    let end = Math.min(index + chunkSize, text.length);

    if (end < text.length) {
      end = text.lastIndexOf(" ", end);
      if (end <= index) end = index + chunkSize;
    }

    chunks.push(text.slice(index, end).trim());
    index = end;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

async function crawlURL(url = "") {
  console.log(`Starting crawl: ${url}`);

  try {
    const { body } = await webScrapping(url);

    const bodyChunks = textChunks(body, 1000);
    console.log(`📝 Found ${bodyChunks.length} chunks for ${url}`);

    for (const chunk of bodyChunks) {
      try {
        const bodyEmbedding = await createVectorEmbed({ text: chunk });
        await insertToDb({
          embedding: bodyEmbedding,
          url: url,
          body: chunk,
        });
      } catch (error) {
        console.error(`Error processing chunk from ${url}:`, error);
      }
    }

    console.log(`Finished crawl: ${url}`);
  } catch (error) {
    console.error(`Failed to crawl ${url}:`, error);
  }
}

async function runCrawlURL() {
  console.log("Crawling started");

  for (const url of urls) {
    await crawlURL(url);
  }

  console.log("Crawling ended");
}

async function chat(question = "") {
  try {
    const questionEmbedding = await createVectorEmbed({ text: question });

    const collection = await chromaClient.getCollection({
      name: SCRAP_DATA_COLLECTION,
    });

    const results = await collection.query({
      queryEmbeddings: [questionEmbedding],
      nResults: 5,
    });


    const body = results.metadatas[0].map((e)=>e.body)
    const url = results.metadatas[0].map((e)=>e.url)

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system",
          content: "You are an AI support agent expert in providing support to user on behalf of webpage. Given the context about page content, reply the user accordingly" 
        },
        { 
          role: "user", 
          content: ` 
          Query: ${question}\n\n
          URLs: ${url.join(', ')}
          Retrived Context: ${body.join(', ')}
          ` 
        },
      ],
    })

    console.log("gptResponse: ",gptResponse.choices[0].message.content)
  } catch (error) {
    console.error("Error during chat:", error);
  }
}

// Main execution
(async () => {
    try {
      // Run the crawler first
      await runCrawlURL();
      
      // Then test the chat function
      await chat(""); //add questions here
    } catch (error) {
      console.error("Main execution error:", error);
    }
  })();
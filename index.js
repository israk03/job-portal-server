require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.e3qys.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // ----> JOB RELATED APIs
    const jobCollections = client.db("jobPortal").collection("jobs");
    const jobApplicationCollections = client
      .db("jobPortal")
      .collection("job_Application");

    app.get("/jobs", async (req, res) => {
      const result = await jobCollections.find().toArray();
      res.send(result);
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollections.findOne(query);
      res.send(result);
    });

    // -----> JOB APPLICATION APIs

    app.get("/job_Application", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await jobApplicationCollections.find(query).toArray();

      for (const application of result) {
        const query1 = { _id: new ObjectId(application.job_id) };
        const job = await jobCollections.findOne(query1);
        if (job) {
          application.title = job.title;
          application.company = job.company;
          application.location = job.location;
          application.salaryRange = job.salaryRange;
          application.company_logo = job.company_logo;
        }
      }
      res.send(result);
    });

    app.post("/job_Applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollections.insertOne(application);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job portal server is running...");
});

app.listen(port, () => {
  console.log(`Job portal running at ${port}`);
});

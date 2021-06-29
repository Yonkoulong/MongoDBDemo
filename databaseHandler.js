const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://longcuonhut:longcuonhut123@cluster0.ramop.mongodb.net/test";
const dbName = "NguyenHaiLongDB";

async function searchProduct(condition,collectionName){
    const dbo = await getDbo();
    const searchCondition = new RegExp(condition,'i')
    var results = await dbo.collection(collectionName).
                                        find({name:searchCondition}).toArray();
    return results;
}

async function insertOneIntoCollection(documentToInsert,collectionName){
    const dbo = await getDbo();
    await dbo.collection(collectionName).insertOne(documentToInsert);
}

async function getDbo() {
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    return dbo;
}

async function checkUser(nameIn,passwordIn){
    const dbo = await getDbo();
    const results = await dbo.collection("users").
         findOne({$and:[{username:nameIn},{password:passwordIn}]});
    if(results != null)
        return true;
    else
        return false;
}

function checkName(value)
{
    for(var i = 0; i < value.length; i++)
    {
        if(value[i] < 'a' || value[i] > 'z')
        {
            return false;
        }   
    }
    return true;
}



module.exports = {searchProduct, insertOneIntoCollection, checkUser, checkName}
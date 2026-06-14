const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database Manager
class JSONDatabase {
  constructor() {
    this.collections = {
      users: [],
      doctors: [],
      appointments: [],
      reports: [],
      prescriptions: [],
      messages: [],
      emergency_contacts: [],
      payments: [],
      contact_messages: []
    };
    this.loadAll();
    this._rebuildIndexes();
  }

  _rebuildIndexes() {
    this._idIndex = {};
    for (const name of Object.keys(this.collections)) {
      this._idIndex[name] = new Map();
      this.collections[name].forEach(item => this._idIndex[name].set(item._id, item));
    }
  }

  loadAll() {
    for (const name of Object.keys(this.collections)) {
      const filePath = path.join(DATA_DIR, `${name}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath, 'utf-8');
          this.collections[name] = JSON.parse(data || '[]');
        } catch (error) {
          console.error(`Error loading database file ${name}.json:`, error);
          this.collections[name] = [];
        }
      } else {
        this.saveCollection(name);
      }
    }
  }

  async saveCollection(name) {
    const filePath = path.join(DATA_DIR, `${name}.json`);
    try {
      const data = JSON.stringify(this.collections[name]);
      await fs.promises.writeFile(filePath, data, 'utf-8');
    } catch (error) {
      console.error(`Error saving database file ${name}.json:`, error);
    }
  }

  findByIdFast(collectionName, id) {
    return this._idIndex[collectionName]?.get(id) || null;
  }

  findOneRaw(collectionName, query) {
    return this.collections[collectionName].find(item => match(item, query));
  }
}

// Helper to match items based on query
function match(item, query) {
  if (!query) return true;
  for (let key in query) {
    const queryVal = query[key];
    const itemVal = item[key];
    
    if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
      if ('$in' in queryVal) {
        if (!Array.isArray(queryVal.$in) || !queryVal.$in.includes(itemVal)) return false;
      } else if ('$ne' in queryVal) {
        if (itemVal === queryVal.$ne) return false;
      } else if ('$regex' in queryVal) {
        const regex = new RegExp(queryVal.$regex, queryVal.$options || '');
        if (!regex.test(itemVal || '')) return false;
      } else {
        if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) return false;
      }
    } else {
      if (itemVal !== queryVal) return false;
    }
  }
  return true;
}

// Mongoose-like Document
class Document {
  constructor(data, model) {
    Object.assign(this, data);
    Object.defineProperty(this, '_model', { value: model, enumerable: false });
  }

  async save() {
    const model = this._model;
    const db = model.db;
    const list = db.collections[model.collectionName];
    const index = list.findIndex(item => item._id === this._id);
    
    const plainData = { ...this };
    plainData.updatedAt = new Date().toISOString();
    
    if (index === -1) {
      list.push(plainData);
    } else {
      list[index] = plainData;
    }
    await db.saveCollection(model.collectionName);
    return this;
  }
}

// Mongoose-like Query Chain
class Query {
  constructor(results, dbInstance, isSingle = false, model) {
    this.results = results;
    this.db = dbInstance;
    this.isSingle = isSingle;
    this.model = model;
  }

  sort(sortObj) {
    if (!sortObj || this.isSingle) return this;
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key]; // 1 or -1
    this.results.sort((a, b) => {
      const valA = a[key] ?? '';
      const valB = b[key] ?? '';
      if (valA < valB) return order === 1 ? -1 : 1;
      if (valA > valB) return order === 1 ? 1 : -1;
      return 0;
    });
    return this;
  }

  populate(path) {
    this.results = this.results.map(item => {
      if (!item) return item;
      const newItem = { ...item };
      const id = newItem[path];
      if (!id) return newItem;

      if (typeof id === 'object') return newItem;

      if (path === 'userId' || path === 'patientId') {
        const user = this.db.findOneRaw('users', { _id: id });
        if (user) {
          const userCopy = { ...user };
          delete userCopy.password;
          newItem[path] = userCopy;
        }
      } else if (path === 'doctorId') {
        const doctor = this.db.findOneRaw('doctors', { _id: id });
        if (doctor) {
          const doctorCopy = { ...doctor };
          const user = this.db.findOneRaw('users', { _id: doctor.userId });
          if (user) {
            const userCopy = { ...user };
            delete userCopy.password;
            doctorCopy.userId = userCopy;
          }
          newItem[path] = doctorCopy;
        }
      } else if (path === 'appointmentId') {
        const appt = this.db.findOneRaw('appointments', { _id: id });
        if (appt) {
          newItem[path] = { ...appt };
        }
      }
      return newItem;
    });
    return this;
  }

  then(onfulfilled, onrejected) {
    const value = this.isSingle ? (this.results[0] || null) : this.results;
    let docValue = null;
    if (this.isSingle) {
      docValue = value ? new Document(value, this.model) : null;
    } else {
      docValue = value.map(item => new Document(item, this.model));
    }
    return Promise.resolve(docValue).then(onfulfilled, onrejected);
  }
}

// Model Function Factory
function createModel(collectionName, dbInstance) {
  function ModelFn(data) {
    return new Document({
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    }, ModelFn);
  }

  ModelFn.collectionName = collectionName;
  ModelFn.db = dbInstance;

  ModelFn.find = function(query) {
    const list = dbInstance.collections[collectionName];
    const filtered = list.filter(item => match(item, query));
    return new Query(filtered, dbInstance, false, ModelFn);
  };

  ModelFn.findOne = function(query) {
    const list = dbInstance.collections[collectionName];
    const filtered = list.filter(item => match(item, query));
    return new Query(filtered, dbInstance, true, ModelFn);
  };

  ModelFn.findById = function(id) {
    return ModelFn.findOne({ _id: id });
  };

  ModelFn.create = async function(data) {
    const newItem = {
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    dbInstance.collections[collectionName].push(newItem);
    if (dbInstance._idIndex[collectionName]) dbInstance._idIndex[collectionName].set(newItem._id, newItem);
    await dbInstance.saveCollection(collectionName);
    return new Document(newItem, ModelFn);
  };

  ModelFn.findByIdAndUpdate = async function(id, updateData, options = {}) {
    const list = dbInstance.collections[collectionName];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;

    const fieldsToUpdate = updateData.$set ? updateData.$set : updateData;
    list[index] = {
      ...list[index],
      ...fieldsToUpdate,
      updatedAt: new Date().toISOString()
    };
    if (dbInstance._idIndex[collectionName]) dbInstance._idIndex[collectionName].set(id, list[index]);
    await dbInstance.saveCollection(collectionName);
    return new Document(list[index], ModelFn);
  };

  ModelFn.findByIdAndDelete = async function(id) {
    const list = dbInstance.collections[collectionName];
    const index = list.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deletedItem = list.splice(index, 1)[0];
    if (dbInstance._idIndex[collectionName]) dbInstance._idIndex[collectionName].delete(id);
    await dbInstance.saveCollection(collectionName);
    return new Document(deletedItem, ModelFn);
  };

  ModelFn.countDocuments = async function(query) {
    const list = dbInstance.collections[collectionName];
    const filtered = list.filter(item => match(item, query));
    return filtered.length;
  };

  return ModelFn;
}

// Instantiate database
const db = new JSONDatabase();

module.exports = {
  db,
  User: createModel('users', db),
  Doctor: createModel('doctors', db),
  Appointment: createModel('appointments', db),
  MedicalReport: createModel('reports', db),
  Prescription: createModel('prescriptions', db),
  Message: createModel('messages', db),
  EmergencyContact: createModel('emergency_contacts', db),
  Payment: createModel('payments', db),
  ContactMessage: createModel('contact_messages', db)
};

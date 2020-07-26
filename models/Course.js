const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // Check to see if there are any course documents within the database
  let count = await mongoose.connection.db
    .collection('Course', CourseSchema)
    .countDocuments();

  // Do if there are documents
  if (count != 0) {
    const obj = await this.aggregate([
      {
        $match: { bootcamp: bootcampId },
      },
      {
        $group: {
          _id: '$bootcamp',
          averageCost: { $avg: '$tuition' },
        },
      },
    ]);
    try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // Else do if they are not.
  else {
  }
};

// Call getAerageCost after save
CourseSchema.post('save', function () {
  try {
    this.constructor.getAverageCost(this.bootcamp);
  } catch (err) {
    console.log('here it is' + err);
  }
});

// Call getAerageCost before remove
CourseSchema.pre('remove', function () {
  try {
    this.constructor.getAverageCost(this.bootcamp);
  } catch (err) {
    console.log('here it is' + err);
  }
});

module.exports = mongoose.model('Course', CourseSchema);

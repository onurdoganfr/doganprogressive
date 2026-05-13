export const EXERCISE_LIBRARY = {
  'Chest': {
    'Weighted':   ['Bench Press','Incline Bench Press','Dumbbell Fly','Cable Fly','Pec Deck'],
    'Bodyweight': ['Push-Up','Wide Push-Up','Diamond Push-Up','Decline Push-Up','Archer Push-Up'],
  },
  'Shoulders': {
    'Weighted':   ['Overhead Press','Lateral Raise','Front Raise','Rear Delt Fly','Arnold Press'],
    'Bodyweight': ['Pike Push-Up','Handstand Push-Up','Shoulder Tap Plank','Wall Walk','Dive Bomber Push-Up'],
  },
  'Back': {
    'Weighted':   ['Pull-up','Lat Pulldown','Barbell Row','Seated Cable Row','Deadlift'],
    'Bodyweight': ['Superman Hold','Back Extension','Reverse Snow Angel','Bird Dog','Prone YTW'],
  },
  'Arms': {
    'Biceps':  ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl'],
    'Triceps': ['Tricep Pushdown','Skull Crusher','Overhead Extension','Close-Grip Bench','Dips'],
  },
  'Legs': {
    'Weighted':   ['Squat','Leg Press','Romanian Deadlift','Leg Curl','Bulgarian Split Squat'],
    'Plyometric': ['Box Jump','Jump Squat','Broad Jump','Tuck Jump','Depth Jump'],
    'Speed':      ['Sprint Intervals','High Knees','Butt Kicks','Lateral Shuffle','Bounding'],
  },
  'Core':   ['Plank','Crunches','Hanging Leg Raise','Ab Wheel','Russian Twist'],
  'Cardio': ['Treadmill','Jump Rope'],
};

export function libAllExercises(cat) {
  const val = EXERCISE_LIBRARY[cat];
  return Array.isArray(val) ? val : Object.values(val).flat();
}

export const GROUP_ORDER = ['Chest', 'Shoulders', 'Back', 'Arms', 'Legs', 'Core', 'Cardio'];

// Flat reverse map: exercise name → top-level group
export const EX_GROUP_MAP = (() => {
  const m = {};
  for (const [group, sub] of Object.entries(EXERCISE_LIBRARY)) {
    const list = Array.isArray(sub) ? sub : Object.values(sub).flat();
    list.forEach(ex => { m[ex] = group; });
  }
  return m;
})();

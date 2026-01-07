'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Filter, Play, Clock, Target, Users, Info, Heart, PawPrint, Activity, Zap } from 'lucide-react'
import { Card } from '@/components/cards/Card'
import { ExerciseCard } from '@/components/cards/ExerciseCard'
import Link from 'next/link'

interface PublicExercise {
  id: string
  name: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  bodyPart: string[]
  equipment: string[]
  category: 'human' | 'pet'
  videoUrl?: string
  benefits: string[]
  instructions: string[]
}

export default function PublicExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [bodyPartFilter, setBodyPartFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedExercise, setSelectedExercise] = useState<PublicExercise | null>(null)

  const humanExercises: PublicExercise[] = [
    // 🦴 NECK (Cervical Spine)
    {
      id: 'neck-1',
      name: 'Neck Flexion',
      description: 'Gentle forward bending of the neck to improve flexibility.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['neck', 'cervical'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves neck flexibility',
        'Reduces stiffness',
        'Enhances range of motion',
        'Relieves tension headaches'
      ],
      instructions: [
        'Sit or stand with good posture',
        'Slowly lower chin toward chest',
        'Hold for 3-5 seconds',
        'Return to neutral position',
        'Repeat 8-10 times'
      ]
    },
    {
      id: 'neck-2',
      name: 'Neck Extension',
      description: 'Backward movement of the neck to strengthen posterior muscles.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['neck', 'cervical'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Strengthens neck extensors',
        'Improves posture',
        'Reduces forward head posture',
        'Enhances spinal alignment'
      ],
      instructions: [
        'Sit upright with shoulders relaxed',
        'Slowly tilt head backward',
        'Look toward ceiling',
        'Hold for 3 seconds',
        'Return to neutral',
        'Repeat 6-8 times'
      ]
    },
    {
      id: 'neck-3',
      name: 'Neck Right Side Bending',
      description: 'Lateral neck movement to improve side flexibility.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['neck', 'cervical'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Increases lateral flexibility',
        'Reduces muscle imbalances',
        'Relieves tension',
        'Improves overall mobility'
      ],
      instructions: [
        'Sit with spine straight',
        'Tilt right ear toward right shoulder',
        'Hold for 5 seconds',
        'Return to center',
        'Repeat on left side',
        'Do 6-8 repetitions each side'
      ]
    },
    {
      id: 'neck-4',
      name: 'Neck Rotation Right',
      description: 'Turning the neck to improve rotational range of motion.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['neck', 'cervical'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves rotational mobility',
        'Reduces stiffness',
        'Enhances driving safety',
        'Decreases risk of injury'
      ],
      instructions: [
        'Sit with good posture',
        'Slowly turn head to the right',
        'Look over right shoulder',
        'Hold for 3 seconds',
        'Return to center',
        'Repeat 8 times each side'
      ]
    },
    {
      id: 'neck-5',
      name: 'Chin Tucks',
      description: 'Exercise to strengthen deep neck flexors and improve posture.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['neck', 'cervical'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Strengthens deep neck flexors',
        'Improves forward head posture',
        'Reduces neck pain',
        'Enhances spinal alignment'
      ],
      instructions: [
        'Sit or stand against a wall',
        'Gently tuck chin backward',
        'Create "double chin" position',
        'Hold for 5 seconds',
        'Relax and repeat',
        'Do 10-15 repetitions'
      ]
    },
    {
      id: 'neck-6',
      name: 'Upper Trapezius Stretch',
      description: 'Stretch for the upper trapezius muscle to relieve tension.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['neck', 'shoulder'],
      equipment: ['chair'],
      category: 'human',
      benefits: [
        'Relieves upper back tension',
        'Reduces headaches',
        'Improves shoulder mobility',
        'Decreases stress'
      ],
      instructions: [
        'Sit on a chair',
        'Hold edge of chair with right hand',
        'Tilt head to left side',
        'Gently pull with left hand',
        'Hold for 20 seconds',
        'Switch sides'
      ]
    },
    {
      id: 'neck-7',
      name: 'Postural Neck Correction',
      description: 'Exercise to correct forward head posture.',
      difficulty: 'intermediate',
      duration: 10,
      bodyPart: ['neck', 'upper back'],
      equipment: ['wall'],
      category: 'human',
      benefits: [
        'Corrects forward head posture',
        'Strengthens weak muscles',
        'Improves breathing',
        'Reduces chronic pain'
      ],
      instructions: [
        'Stand with back against wall',
        'Heels 2 inches from wall',
        'Press entire spine to wall',
        'Tuck chin and hold',
        'Maintain for 30 seconds',
        'Repeat 5 times'
      ]
    },

    // 🤲 SHOULDER
    {
      id: 'shoulder-1',
      name: 'Pendulum Exercise',
      description: 'Gentle swinging motion to improve shoulder mobility.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['shoulder'],
      equipment: ['table'],
      category: 'human',
      benefits: [
        'Improves shoulder mobility',
        'Reduces pain',
        'Maintains range of motion',
        'Promotes healing'
      ],
      instructions: [
        'Lean forward supporting with good arm',
        'Let affected arm hang down',
        'Gently swing arm in small circles',
        'Progress to larger circles',
        'Do for 1-2 minutes',
        'Repeat 2-3 times daily'
      ]
    },
    {
      id: 'shoulder-2',
      name: 'Shoulder Flexion ROM',
      description: 'Improve forward shoulder movement range.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['shoulder'],
      equipment: ['wand', 'stick'],
      category: 'human',
      benefits: [
        'Increases forward reach',
        'Reduces stiffness',
        'Improves daily function',
        'Enhances dressing ability'
      ],
      instructions: [
        'Lie on back or stand',
        'Hold wand with both hands',
        'Slowly raise arms overhead',
        'Keep elbows straight',
        'Hold for 5 seconds',
        'Repeat 10 times'
      ]
    },
    {
      id: 'shoulder-3',
      name: 'Wall Crawl (Flexion)',
      description: 'Walking fingers up wall to improve shoulder mobility.',
      difficulty: 'beginner',
      duration: 10,
      bodyPart: ['shoulder'],
      equipment: ['wall'],
      category: 'human',
      benefits: [
        'Gradually increases range',
        'Builds confidence',
        'Reduces fear of movement',
        'Improves functional reach'
      ],
      instructions: [
        'Stand facing wall',
        'Walk fingers up wall',
        'Go as high as comfortable',
        'Hold for 10 seconds',
        'Slowly walk back down',
        'Repeat 5-8 times'
      ]
    },
    {
      id: 'shoulder-4',
      name: 'Scapular Retraction',
      description: 'Squeezing shoulder blades together to improve posture.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['shoulder', 'upper back'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Strengthens upper back',
        'Improves posture',
        'Reduces rounded shoulders',
        'Decreases neck pain'
      ],
      instructions: [
        'Sit or stand straight',
        'Squeeze shoulder blades together',
        'Imagine holding pencil between them',
        'Hold for 5 seconds',
        'Relax completely',
        'Repeat 15-20 times'
      ]
    },
    {
      id: 'shoulder-5',
      name: 'Cross-Body Shoulder Stretch',
      description: 'Stretch for posterior shoulder capsule.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['shoulder'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves shoulder flexibility',
        'Reduces tightness',
        'Enhances throwing motion',
        'Prevents injury'
      ],
      instructions: [
        'Bring right arm across chest',
        'Use left hand to pull gently',
        'Hold for 20-30 seconds',
        'Keep shoulder relaxed',
        'Switch to left arm',
        'Repeat 2-3 times each side'
      ]
    },

    // 💪 ELBOW & FOREARM
    {
      id: 'elbow-1',
      name: 'Elbow Flexion/Extension',
      description: 'Basic elbow bending and straightening exercise.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['elbow'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Maintains elbow range',
        'Reduces stiffness',
        'Improves daily function',
        'Promotes healing'
      ],
      instructions: [
        'Sit with arm supported',
        'Slowly bend elbow fully',
        'Hold for 2 seconds',
        'Straighten completely',
        'Move slowly and smoothly',
        'Repeat 15-20 times'
      ]
    },
    {
      id: 'elbow-2',
      name: 'Forearm Pronation/Supination',
      description: 'Rotating forearm to improve wrist and elbow function.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['elbow', 'forearm'],
      equipment: ['dumbbell'],
      category: 'human',
      benefits: [
        'Improves rotational ability',
        'Enhances grip strength',
        'Reduces tennis elbow risk',
        'Improves functional tasks'
      ],
      instructions: [
        'Hold light weight or can',
        'Start with palm up',
        'Rotate to palm down',
        'Keep elbow at side',
        'Control movement',
        'Do 15 repetitions'
      ]
    },
    {
      id: 'elbow-3',
      name: 'Wrist Flexion/Extension',
      description: 'Strengthening exercises for wrist muscles.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['wrist', 'forearm'],
      equipment: ['light weight'],
      category: 'human',
      benefits: [
        'Strengthens wrist muscles',
        'Improves grip',
        'Reduces repetitive strain',
        'Enhances hand function'
      ],
      instructions: [
        'Support forearm on table',
        'Hold weight in hand',
        'Bend wrist upward',
        'Lower slowly',
        'Then bend downward',
        'Do 10-15 reps each way'
      ]
    },
    {
      id: 'elbow-4',
      name: 'Tennis Elbow Stretch',
      description: 'Stretch for lateral epicondylitis (tennis elbow).',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['elbow', 'forearm'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Reduces lateral elbow pain',
        'Improves flexibility',
        'Decreases inflammation',
        'Promotes healing'
      ],
      instructions: [
        'Extend affected arm straight',
        'Palm facing down',
        'Use other hand to bend wrist',
        'Feel stretch in forearm',
        'Hold for 20 seconds',
        'Repeat 3 times'
      ]
    },

    // ✋ WRIST & HAND
    {
      id: 'wrist-1',
      name: 'Hand Opening & Closing',
      description: 'Basic hand exercise to improve mobility and strength.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['hand', 'wrist'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Maintains hand mobility',
        'Reduces stiffness',
        'Improves circulation',
        'Prevents contractures'
      ],
      instructions: [
        'Make tight fist',
        'Hold for 3 seconds',
        'Open hand completely',
        'Spread fingers wide',
        'Hold for 3 seconds',
        'Repeat 20 times'
      ]
    },
    {
      id: 'wrist-2',
      name: 'Finger Abduction/Adduction',
      description: 'Spreading and bringing fingers together.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['hand'],
      equipment: ['rubber band'],
      category: 'human',
      benefits: [
        'Strengthens hand muscles',
        'Improves finger control',
        'Enhances fine motor skills',
        'Reduces stiffness'
      ],
      instructions: [
        'Place rubber band around fingers',
        'Spread fingers against resistance',
        'Hold for 2 seconds',
        'Slowly return together',
        'Keep thumb out',
        'Do 15-20 repetitions'
      ]
    },
    {
      id: 'wrist-3',
      name: 'Thumb Opposition',
      description: 'Touching thumb to each fingertip.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['hand'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves thumb mobility',
        'Enhances pinch grip',
        'Essential for fine tasks',
        'Prevents thumb stiffness'
      ],
      instructions: [
        'Touch thumb to index finger',
        'Form "O" shape',
        'Hold for 2 seconds',
        'Repeat with each finger',
        'Move slowly and precisely',
        'Do 10 cycles'
      ]
    },
    {
      id: 'wrist-4',
      name: 'Stress Ball Squeeze',
      description: 'Strengthening exercise using stress ball.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['hand', 'forearm'],
      equipment: ['stress ball'],
      category: 'human',
      benefits: [
        'Builds hand strength',
        'Reduces stress',
        'Improves grip',
        'Enhances circulation'
      ],
      instructions: [
        'Hold stress ball in hand',
        'Squeeze as hard as comfortable',
        'Hold for 3 seconds',
        'Slowly release',
        'Rest for 2 seconds',
        'Repeat 15-20 times'
      ]
    },

    // 🧍 LOWER BACK (Lumbar Spine)
    {
      id: 'back-1',
      name: 'Pelvic Tilt',
      description: 'Basic exercise to mobilize lumbar spine.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['lower back', 'core'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Mobilizes lumbar spine',
        'Strengthens core',
        'Reduces back pain',
        'Improves posture'
      ],
      instructions: [
        'Lie on back with knees bent',
        'Flatten lower back against floor',
        'Tilt pelvis upward',
        'Hold for 5 seconds',
        'Relax back to neutral',
        'Repeat 10-15 times'
      ]
    },
    {
      id: 'back-2',
      name: 'Cat-Camel Stretch',
      description: 'Dynamic spinal mobility exercise.',
      difficulty: 'beginner',
      duration: 10,
      bodyPart: ['back', 'spine'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Improves spinal flexibility',
        'Reduces stiffness',
        'Enhances mobility',
        'Decreases pain'
      ],
      instructions: [
        'Start on hands and knees',
        'Arch back upward (cat)',
        'Hold for 3 seconds',
        'Drop belly toward floor (camel)',
        'Hold for 3 seconds',
        'Repeat 10-15 times'
      ]
    },
    {
      id: 'back-3',
      name: 'Bridging',
      description: 'Exercise to strengthen glutes and stabilize spine.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['lower back', 'glutes'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Strengthens gluteal muscles',
        'Stabilizes pelvis',
        'Reduces back pain',
        'Improves hip mobility'
      ],
      instructions: [
        'Lie on back, knees bent',
        'Lift hips toward ceiling',
        'Squeeze glutes at top',
        'Hold for 3 seconds',
        'Lower slowly',
        'Repeat 12-15 times'
      ]
    },
    {
      id: 'back-4',
      name: 'Bird Dog',
      description: 'Core stabilization exercise.',
      difficulty: 'intermediate',
      duration: 10,
      bodyPart: ['core', 'back'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Improves core stability',
        'Enhances balance',
        'Reduces back pain',
        'Improves coordination'
      ],
      instructions: [
        'Start on hands and knees',
        'Extend right arm forward',
        'Extend left leg backward',
        'Hold for 5 seconds',
        'Return to start',
        'Alternate sides, 10 each'
      ]
    },
    {
      id: 'back-5',
      name: 'Dead Bug Exercise',
      description: 'Core stabilization while moving limbs.',
      difficulty: 'intermediate',
      duration: 12,
      bodyPart: ['core', 'back'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Strengthens deep core',
        'Improves coordination',
        'Reduces back pain',
        'Enhances stability'
      ],
      instructions: [
        'Lie on back, knees bent 90°',
        'Arms extended toward ceiling',
        'Slowly lower opposite arm/leg',
        'Keep back flat on floor',
        'Return to start',
        'Alternate sides, 12 each'
      ]
    },

    // 🦵 HIP
    {
      id: 'hip-1',
      name: 'Hip Flexion',
      description: 'Lifting knee toward chest to improve hip mobility.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['hip'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves hip mobility',
        'Reduces stiffness',
        'Enhances walking ability',
        'Decreases pain'
      ],
      instructions: [
        'Lie on back or stand',
        'Slowly bring knee toward chest',
        'Hold for 3 seconds',
        'Lower slowly',
        'Keep back straight',
        'Repeat 10-12 times each leg'
      ]
    },
    {
      id: 'hip-2',
      name: 'Hip Abduction',
      description: 'Moving leg away from midline to strengthen hip muscles.',
      difficulty: 'beginner',
      duration: 9,
      bodyPart: ['hip'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Strengthens hip abductors',
        'Improves stability',
        'Reduces knee pain',
        'Enhances balance'
      ],
      instructions: [
        'Lie on side, legs straight',
        'Lift top leg upward',
        'Keep foot parallel to floor',
        'Lower slowly',
        'Don\'t let hips roll backward',
        'Do 12-15 repetitions each side'
      ]
    },
    {
      id: 'hip-3',
      name: 'Clamshell Exercise',
      description: 'Exercise to strengthen gluteus medius.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['hip', 'glutes'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Strengthens hip external rotators',
        'Improves hip stability',
        'Reduces knee pain',
        'Prevents injury'
      ],
      instructions: [
        'Lie on side, knees bent 90°',
        'Keep feet together',
        'Open top knee like clamshell',
        'Don\'t let hips roll back',
        'Lower slowly',
        'Repeat 15-20 times each side'
      ]
    },
    {
      id: 'hip-4',
      name: 'Hip Bridge',
      description: 'Exercise to strengthen glutes and hamstrings.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['hip', 'glutes'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Strengthens posterior chain',
        'Improves hip extension',
        'Reduces back pain',
        'Enhances athletic performance'
      ],
      instructions: [
        'Lie on back, knees bent',
        'Feet flat on floor',
        'Lift hips toward ceiling',
        'Squeeze glutes at top',
        'Hold for 2 seconds',
        'Lower slowly, repeat 15 times'
      ]
    },
    {
      id: 'hip-5',
      name: 'Hip Flexor Stretch',
      description: 'Stretch for tight hip flexor muscles.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['hip'],
      equipment: ['mat'],
      category: 'human',
      benefits: [
        'Reduces hip flexor tightness',
        'Improves posture',
        'Decreases back pain',
        'Enhances walking ability'
      ],
      instructions: [
        'Kneel on one knee',
        'Front foot flat on floor',
        'Gently push hips forward',
        'Keep back straight',
        'Hold for 30 seconds',
        'Switch sides'
      ]
    },

    // 🦵 KNEE
    {
      id: 'knee-1',
      name: 'Quadriceps Sets',
      description: 'Isometric quadriceps contraction.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['knee', 'thigh'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Maintains quadriceps strength',
        'Reduces atrophy',
        'Improves knee stability',
        'Promotes healing'
      ],
      instructions: [
        'Sit or lie with leg straight',
        'Tighten thigh muscle',
        'Push back of knee downward',
        'Hold for 5 seconds',
        'Relax completely',
        'Repeat 20 times'
      ]
    },
    {
      id: 'knee-2',
      name: 'Straight Leg Raise',
      description: 'Leg lifting exercise with straight knee.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['knee', 'thigh'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Strengthens quadriceps',
        'Improves knee control',
        'Reduces swelling',
        'Maintains muscle mass'
      ],
      instructions: [
        'Lie on back, one knee bent',
        'Straighten other leg',
        'Tighten thigh muscle',
        'Lift leg 12 inches',
        'Hold for 3 seconds',
        'Lower slowly, 15 reps each'
      ]
    },
    {
      id: 'knee-3',
      name: 'Heel Slides',
      description: 'Sliding heel to bend knee.',
      difficulty: 'beginner',
      duration: 9,
      bodyPart: ['knee'],
      equipment: ['towel', 'smooth surface'],
      category: 'human',
      benefits: [
        'Improves knee flexion',
        'Reduces stiffness',
        'Promotes range of motion',
        'Enhances walking ability'
      ],
      instructions: [
        'Sit or lie with legs straight',
        'Slowly slide heel toward buttocks',
        'Slide as far as comfortable',
        'Hold for 5 seconds',
        'Slide back to start',
        'Repeat 15-20 times'
      ]
    },
    {
      id: 'knee-4',
      name: 'Mini Squats',
      description: 'Partial squats to strengthen legs.',
      difficulty: 'beginner',
      duration: 10,
      bodyPart: ['knee', 'thigh'],
      equipment: ['chair'],
      category: 'human',
      benefits: [
        'Strengthens leg muscles',
        'Improves functional ability',
        'Enhances balance',
        'Reduces fall risk'
      ],
      instructions: [
        'Stand holding chair for support',
        'Slowly bend knees partially',
        'Keep knees over ankles',
        'Back straight, chest up',
        'Return to standing',
        'Repeat 10-15 times'
      ]
    },
    {
      id: 'knee-5',
      name: 'Step-Ups',
      description: 'Stepping up onto platform.',
      difficulty: 'intermediate',
      duration: 12,
      bodyPart: ['knee', 'thigh'],
      equipment: ['step', 'stair'],
      category: 'human',
      benefits: [
        'Improves functional strength',
        'Enhances stair climbing',
        'Builds confidence',
        'Reduces fear of movement'
      ],
      instructions: [
        'Stand facing step (4-6 inches)',
        'Step up with affected leg',
        'Bring other foot up',
        'Step back down slowly',
        'Control movement',
        'Do 10-12 repetitions each leg'
      ]
    },

    // 🦶 ANKLE & FOOT
    {
      id: 'ankle-1',
      name: 'Ankle Pumps',
      description: 'Basic ankle movement to improve circulation.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['ankle', 'foot'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves circulation',
        'Reduces swelling',
        'Prevents blood clots',
        'Maintains ankle mobility'
      ],
      instructions: [
        'Sit or lie with legs elevated',
        'Point toes away from you',
        'Pull toes toward you',
        'Move through full range',
        'Do 20-30 repetitions',
        'Repeat several times daily'
      ]
    },
    {
      id: 'ankle-2',
      name: 'Ankle Circles',
      description: 'Circular ankle movements.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['ankle', 'foot'],
      equipment: ['none'],
      category: 'human',
      benefits: [
        'Improves ankle mobility',
        'Reduces stiffness',
        'Enhances proprioception',
        'Promotes healing'
      ],
      instructions: [
        'Sit with leg extended',
        'Slowly make circles with ankle',
        '10 circles clockwise',
        '10 circles counterclockwise',
        'Keep movement smooth',
        'Repeat 2-3 times'
      ]
    },
    {
      id: 'ankle-3',
      name: 'Dorsiflexion/Plantarflexion',
      description: 'Ankle up and down movements.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['ankle', 'foot'],
      equipment: ['resistance band'],
      category: 'human',
      benefits: [
        'Strengthens ankle muscles',
        'Improves walking ability',
        'Reduces risk of sprains',
        'Enhances balance'
      ],
      instructions: [
        'Sit with leg extended',
        'Wrap band around foot',
        'Pull toes toward you',
        'Resist with band',
        'Then point toes away',
        'Do 15 reps each direction'
      ]
    },
    {
      id: 'ankle-4',
      name: 'Towel Scrunches',
      description: 'Exercise to strengthen foot muscles.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['foot'],
      equipment: ['towel'],
      category: 'human',
      benefits: [
        'Strengthens foot muscles',
        'Improves arch support',
        'Reduces plantar fasciitis pain',
        'Enhances balance'
      ],
      instructions: [
        'Sit with towel on floor',
        'Place foot on towel',
        'Scrunch towel with toes',
        'Pull towel toward you',
        'Relax and repeat',
        'Do 15-20 repetitions'
      ]
    },
    {
      id: 'ankle-5',
      name: 'Heel Raises',
      description: 'Rising up on toes to strengthen calves.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['ankle', 'calf'],
      equipment: ['wall', 'chair'],
      category: 'human',
      benefits: [
        'Strengthens calf muscles',
        'Improves ankle stability',
        'Enhances push-off in walking',
        'Reduces Achilles tendon issues'
      ],
      instructions: [
        'Stand holding chair or wall',
        'Rise up on toes',
        'Hold for 2 seconds',
        'Lower slowly',
        'Keep knees straight',
        'Repeat 15-20 times'
      ]
    },
  ]

  const petExercises: PublicExercise[] = [
    // Passive Range of Motion (PROM) Exercises
    {
      id: 'pet-1',
      name: 'Passive Leg Flexion & Extension',
      description: 'Gentle bending and straightening of pet\'s legs.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['hind legs', 'front legs'],
      equipment: ['towel', 'mat'],
      category: 'pet',
      benefits: [
        'Maintains joint mobility',
        'Prevents stiffness',
        'Improves circulation',
        'Reduces muscle atrophy'
      ],
      instructions: [
        'Place pet in comfortable side-lying position',
        'Gently bend leg at joint',
        'Hold for 2-3 seconds',
        'Slowly straighten leg',
        'Move through comfortable range',
        'Repeat 5-10 times per leg'
      ]
    },
    {
      id: 'pet-2',
      name: 'Gentle Hip ROM',
      description: 'Passive hip movement exercises.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['hip'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Maintains hip flexibility',
        'Reduces arthritis pain',
        'Improves mobility',
        'Prevents contractures'
      ],
      instructions: [
        'With pet lying on side',
        'Support leg at knee and ankle',
        'Gently move hip through range',
        'Small circles if tolerated',
        'Stop if pet shows discomfort',
        '1-2 minutes per side'
      ]
    },
    {
      id: 'pet-3',
      name: 'Shoulder ROM (Front Legs)',
      description: 'Passive shoulder movement for front legs.',
      difficulty: 'beginner',
      duration: 6,
      bodyPart: ['shoulder'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Maintains shoulder mobility',
        'Prevents stiffness',
        'Improves walking ability',
        'Reduces pain'
      ],
      instructions: [
        'Support front leg',
        'Gently bend and straighten',
        'Move shoulder forward/backward',
        'Keep movements slow',
        'Watch for discomfort signs',
        '5-8 repetitions per leg'
      ]
    },
    {
      id: 'pet-4',
      name: 'Elbow & Knee Bending',
      description: 'Passive joint movements.',
      difficulty: 'beginner',
      duration: 7,
      bodyPart: ['elbow', 'knee'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Maintains joint health',
        'Prevents contractures',
        'Improves range of motion',
        'Reduces swelling'
      ],
      instructions: [
        'Support leg above and below joint',
        'Bend joint to comfortable limit',
        'Hold for 2 seconds',
        'Straighten gently',
        'Never force movement',
        '5-10 repetitions each joint'
      ]
    },
    {
      id: 'pet-5',
      name: 'Gentle Neck Side Turns',
      description: 'Passive neck mobility exercises.',
      difficulty: 'beginner',
      duration: 5,
      bodyPart: ['neck'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Maintains neck flexibility',
        'Improves head movement',
        'Reduces stiffness',
        'Enhances comfort'
      ],
      instructions: [
        'With pet sitting or lying',
        'Gently turn head to side',
        'Hold for 2-3 seconds',
        'Return to center',
        'Repeat other side',
        '3-5 times each side'
      ]
    },

    // Assisted Standing & Weight Bearing
    {
      id: 'pet-6',
      name: 'Sit-to-Stand (From Bed or Floor)',
      description: 'Assisted transitions from sitting to standing.',
      difficulty: 'intermediate',
      duration: 10,
      bodyPart: ['hind legs', 'core'],
      equipment: ['harness', 'towel'],
      category: 'pet',
      benefits: [
        'Improves functional strength',
        'Builds confidence',
        'Enhances independence',
        'Reduces caregiver burden'
      ],
      instructions: [
        'Use harness or towel under belly',
        'Gently assist to standing',
        'Allow pet to bear weight',
        'Hold for 5-10 seconds',
        'Assist back to sitting',
        'Repeat 3-5 times'
      ]
    },
    {
      id: 'pet-7',
      name: 'Assisted Standing Hold',
      description: 'Supported standing position.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['all legs'],
      equipment: ['towel', 'harness'],
      category: 'pet',
      benefits: [
        'Improves weight bearing',
        'Maintains muscle tone',
        'Enhances circulation',
        'Builds endurance'
      ],
      instructions: [
        'Support pet with towel/harness',
        'Hold in standing position',
        'Start with 15-30 seconds',
        'Gradually increase time',
        'Ensure even weight distribution',
        '2-3 times daily'
      ]
    },
    {
      id: 'pet-8',
      name: 'Weight Shifting (Side-to-Side)',
      description: 'Encouraging weight transfer between legs.',
      difficulty: 'intermediate',
      duration: 8,
      bodyPart: ['hind legs', 'core'],
      equipment: ['treats'],
      category: 'pet',
      benefits: [
        'Improves balance',
        'Strengthens stabilizing muscles',
        'Enhances proprioception',
        'Reduces fall risk'
      ],
      instructions: [
        'With pet standing',
        'Hold treat to one side',
        'Encourage weight shift',
        'Hold for 3-5 seconds',
        'Return to center',
        'Repeat other side'
      ]
    },

    // Balance & Proprioception
    {
      id: 'pet-9',
      name: 'Three-Leg Standing',
      description: 'Briefly lifting one paw while standing.',
      difficulty: 'intermediate',
      duration: 9,
      bodyPart: ['all legs'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Improves balance',
        'Strengthens stabilizing muscles',
        'Enhances body awareness',
        'Builds confidence'
      ],
      instructions: [
        'With pet standing',
        'Gently lift one front paw',
        'Hold for 2-3 seconds',
        'Return to standing',
        'Repeat with other paws',
        '2-3 times per paw'
      ]
    },
    {
      id: 'pet-10',
      name: 'Standing on Soft Surface',
      description: 'Standing on unstable surface.',
      difficulty: 'advanced',
      duration: 10,
      bodyPart: ['all legs'],
      equipment: ['pillow', 'cushion', 'mat'],
      category: 'pet',
      benefits: [
        'Improves proprioception',
        'Strengthens stabilizing muscles',
        'Enhances balance',
        'Prevents re-injury'
      ],
      instructions: [
        'Place pet on soft surface',
        'Support as needed',
        'Encourage standing',
        'Start with 10-15 seconds',
        'Gradually increase time',
        'Always supervise'
      ]
    },

    // Assisted Walking & Gait Training
    {
      id: 'pet-11',
      name: 'Slow Figure-8 Walking Indoors',
      description: 'Walking in figure-8 pattern.',
      difficulty: 'intermediate',
      duration: 12,
      bodyPart: ['all legs'],
      equipment: ['leash', 'harness'],
      category: 'pet',
      benefits: [
        'Improves coordination',
        'Enhances turning ability',
        'Builds endurance',
        'Strengthens muscles'
      ],
      instructions: [
        'Use harness for support',
        'Walk in slow figure-8 pattern',
        'Keep turns gentle and wide',
        'Start with 1-2 minutes',
        'Rest as needed',
        '2-3 times daily'
      ]
    },
    {
      id: 'pet-12',
      name: 'Pause-and-Go Walking Drill',
      description: 'Walking with controlled stops.',
      difficulty: 'intermediate',
      duration: 15,
      bodyPart: ['all legs'],
      equipment: ['leash', 'harness'],
      category: 'pet',
      benefits: [
        'Improves control',
        'Builds endurance',
        'Enhances obedience',
        'Strengthens muscles'
      ],
      instructions: [
        'Walk few steps, then stop',
        'Wait 3-5 seconds',
        'Walk few more steps',
        'Repeat pattern',
        'Keep sessions short',
        '3-5 minutes total'
      ]
    },

    // Fine Motor & Paw Control
    {
      id: 'pet-13',
      name: 'Towel Scrunching with Paws',
      description: 'Encouraging paw movement on towel.',
      difficulty: 'beginner',
      duration: 8,
      bodyPart: ['front legs', 'paws'],
      equipment: ['towel', 'treats'],
      category: 'pet',
      benefits: [
        'Improves paw strength',
        'Enhances coordination',
        'Maintains flexibility',
        'Provides mental stimulation'
      ],
      instructions: [
        'Place towel on floor',
        'Hide treats underneath',
        'Encourage pet to dig/paw',
        'Use nose to find treats',
        'Supervise closely',
        '5-10 minutes session'
      ]
    },
    {
      id: 'pet-14',
      name: 'Paw Placement Training',
      description: 'Teaching paw targeting.',
      difficulty: 'intermediate',
      duration: 10,
      bodyPart: ['front legs', 'paws'],
      equipment: ['target stick', 'treats'],
      category: 'pet',
      benefits: [
        'Improves coordination',
        'Enhances body awareness',
        'Provides mental stimulation',
        'Builds confidence'
      ],
      instructions: [
        'Use target stick or hand',
        'Encourage paw touch',
        'Reward with treat',
        'Start with easy targets',
        'Gradually increase difficulty',
        '5-10 repetitions'
      ]
    },

    // Hydrotherapy & Supportive Care
    {
      id: 'pet-15',
      name: 'Assisted Walking (Towel Under Belly)',
      description: 'Supported walking with towel.',
      difficulty: 'beginner',
      duration: 12,
      bodyPart: ['hind legs'],
      equipment: ['towel', 'harness'],
      category: 'pet',
      benefits: [
        'Supports weak hindquarters',
        'Improves walking ability',
        'Builds confidence',
        'Reduces fear of walking'
      ],
      instructions: [
        'Place towel under belly',
        'Support hind end',
        'Assist with walking',
        'Keep sessions short',
        'Rest frequently',
        '2-3 minutes at a time'
      ]
    },
    {
      id: 'pet-16',
      name: 'Gentle Muscle Massage',
      description: 'Therapeutic massage for pets.',
      difficulty: 'beginner',
      duration: 15,
      bodyPart: ['back', 'legs'],
      equipment: ['none'],
      category: 'pet',
      benefits: [
        'Reduces muscle tension',
        'Improves circulation',
        'Promotes relaxation',
        'Reduces pain'
      ],
      instructions: [
        'Use gentle circular motions',
        'Start at head, work toward tail',
        'Focus on tight areas',
        'Watch for relaxation signs',
        '5-10 minutes per session',
        'Daily if tolerated'
      ]
    },
    {
      id: 'pet-17',
      name: 'Warm Compress on Stiff Joints',
      description: 'Applying warmth to stiff joints.',
      difficulty: 'beginner',
      duration: 10,
      bodyPart: ['joints'],
      equipment: ['warm towel', 'heating pad'],
      category: 'pet',
      benefits: [
        'Reduces stiffness',
        'Improves circulation',
        'Relieves pain',
        'Prepares for exercise'
      ],
      instructions: [
        'Use warm (not hot) compress',
        'Apply to affected joint',
        'Hold for 5-10 minutes',
        'Check skin frequently',
        'Follow with gentle ROM',
        '1-2 times daily'
      ]
    },
  ]

  const exercises = [...humanExercises, ...petExercises]

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter
    const matchesBodyPart = bodyPartFilter === 'all' || exercise.bodyPart.includes(bodyPartFilter)
    const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter
    
    return matchesSearch && matchesDifficulty && matchesBodyPart && matchesCategory
  })

  const bodyParts = Array.from(new Set(exercises.flatMap(ex => ex.bodyPart)))
  const uniqueBodyParts = Array.from(new Set(bodyParts))

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Complete Exercise Library
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Browse hundreds of physiotherapy exercises for humans and pets with detailed instructions and benefits
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <Target className="w-6 h-6" />, value: exercises.length.toString(), label: 'Total Exercises', color: 'text-teal-600' },
            { icon: <Heart className="w-6 h-6" />, value: humanExercises.length.toString(), label: 'Human Exercises', color: 'text-blue-600' },
            { icon: <PawPrint className="w-6 h-6" />, value: petExercises.length.toString(), label: 'Pet Exercises', color: 'text-amber-600' },
            { icon: <Clock className="w-6 h-6" />, value: '5-30 min', label: 'Duration Range', color: 'text-emerald-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${stat.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-slate-600">
                    {stat.label}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-slate-400" />
                <select
                  value={bodyPartFilter}
                  onChange={(e) => setBodyPartFilter(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Body Parts</option>
                  {uniqueBodyParts.map(part => (
                    <option key={part} value={part}>
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Categories</option>
                  <option value="human">Human Exercises</option>
                  <option value="pet">Pet Exercises</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${categoryFilter === 'all' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All Exercises ({exercises.length})
            </button>
            <button
              onClick={() => setCategoryFilter('human')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${categoryFilter === 'human' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
            >
              <Heart className="w-4 h-4" />
              Human ({humanExercises.length})
            </button>
            <button
              onClick={() => setCategoryFilter('pet')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${categoryFilter === 'pet' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
            >
              <PawPrint className="w-4 h-4" />
              Pet ({petExercises.length})
            </button>
          </div>
        </div>

        {/* Exercises Grid */}
        <AnimatePresence mode="wait">
          {filteredExercises.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No exercises found</p>
              <p className="text-sm text-slate-500 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="exercises"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredExercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExerciseCard 
                    exercise={exercise} 
                    isPublic 
                    onClick={() => setSelectedExercise(exercise)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise Detail Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedExercise(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedExercise.category === 'pet' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                            <PawPrint className="w-3 h-3" />
                            Pet Exercise
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <Heart className="w-3 h-3" />
                            Human Exercise
                          </span>
                        )}
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          selectedExercise.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : selectedExercise.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedExercise.difficulty}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedExercise.name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {selectedExercise.duration} minutes
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-sm text-slate-600">
                          {selectedExercise.bodyPart.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(', ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Description
                        </h3>
                        <p className="text-slate-600">
                          {selectedExercise.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Benefits
                        </h3>
                        <ul className="space-y-2">
                          {selectedExercise.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                selectedExercise.category === 'pet' ? 'bg-amber-500' : 'bg-teal-500'
                              }`} />
                              <span className="text-slate-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Equipment Needed
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedExercise.equipment.map((item, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                selectedExercise.category === 'pet' 
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">
                          Instructions
                        </h3>
                        <ol className="space-y-3">
                          {selectedExercise.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                selectedExercise.category === 'pet' 
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-teal-100 text-teal-600'
                              }`}>
                                {index + 1}
                              </div>
                              <span className="text-slate-600">{instruction}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className={`border rounded-lg p-4 ${
                        selectedExercise.category === 'pet' 
                          ? 'bg-amber-50 border-amber-100'
                          : 'bg-teal-50 border-teal-100'
                      }`}>
                        <div className="flex items-center space-x-2 mb-3">
                          <Info className={`w-5 h-5 ${
                            selectedExercise.category === 'pet' ? 'text-amber-600' : 'text-teal-600'
                          }`} />
                          <h4 className={`font-semibold ${
                            selectedExercise.category === 'pet' ? 'text-amber-900' : 'text-teal-900'
                          }`}>
                            Safety Tips
                          </h4>
                        </div>
                        <ul className={`space-y-2 text-sm ${
                          selectedExercise.category === 'pet' ? 'text-amber-800' : 'text-teal-800'
                        }`}>
                          {selectedExercise.category === 'pet' ? (
                            <>
                              <li>• Stop if your pet shows signs of pain or discomfort</li>
                              <li>• Always supervise during exercises</li>
                              <li>• Start with short sessions and gradually increase</li>
                              <li>• Consult your veterinarian before starting new exercises</li>
                              <li>• Use positive reinforcement with treats and praise</li>
                            </>
                          ) : (
                            <>
                              <li>• Stop if you feel sharp pain</li>
                              <li>• Maintain proper breathing throughout</li>
                              <li>• Move slowly and with control</li>
                              <li>• Consult your doctor before starting new exercises</li>
                              <li>• Listen to your body and adjust as needed</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-slate-600 text-center sm:text-left">
                        {selectedExercise.category === 'pet' 
                          ? 'Exercise reviewed and approved by certified veterinary physiotherapists'
                          : 'Exercise reviewed and approved by certified physiotherapists'}
                      </p>
                      <Link
                        href="/register"
                        className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors duration-200 whitespace-nowrap"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Your Journey
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-8 text-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Start Your Recovery Journey?
              </h2>
              <p className="mb-6 opacity-90">
                Join thousands of {categoryFilter === 'pet' ? 'pet owners' : 'patients'} who have improved {categoryFilter === 'pet' ? 'their pets\'' : ''} mobility with guided physiotherapy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  Get Started Free
                  <Play className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/public/exercises"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  Browse More Exercises
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
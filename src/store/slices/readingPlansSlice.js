import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  plans: [
    {
      id: 'ramadan-khatm',
      name: 'Ramadan Khatm',
      description: 'Complete the Quran during Ramadan',
      duration: 30,
      type: 'fixed',
      targetPages: 20,
      targetJuz: 1,
      createdAt: '2025-02-15T12:00:00Z',
      progress: {
        completed: 0,
        streak: 0,
        lastRead: null,
        completedDays: [],
      },
    },
    {
      id: 'daily-page',
      name: 'Daily Page',
      description: 'Read one page of the Quran every day',
      duration: -1, // Ongoing
      type: 'continuous',
      targetPages: 1,
      createdAt: '2025-01-10T09:30:00Z',
      progress: {
        completed: 142,
        streak: 23,
        lastRead: '2025-03-02T21:15:00Z',
        completedDays: [],
      },
    },
  ],
  activeId: 'daily-page',
};

const readingPlansSlice = createSlice({
  name: 'readingPlans',
  initialState,
  reducers: {
    createPlan: (state, action) => {
      const newPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        progress: {
          completed: 0,
          streak: 0,
          lastRead: null,
          completedDays: [],
        },
        ...action.payload,
      };
      state.plans.push(newPlan);
    },
    
    updateProgress: (state, action) => {
      const { planId, progress } = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);
      
      if (planIndex !== -1) {
        state.plans[planIndex].progress = {
          ...state.plans[planIndex].progress,
          ...progress,
        };
      }
    },
    
    updatePlan: (state, action) => {
      const { id, updates } = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === id);
      
      if (planIndex !== -1) {
        state.plans[planIndex] = {
          ...state.plans[planIndex],
          ...updates,
        };
      }
    },
    
    deletePlan: (state, action) => {
      const id = action.payload;
      state.plans = state.plans.filter(plan => plan.id !== id);
      
      if (state.activeId === id && state.plans.length > 0) {
        state.activeId = state.plans[0].id;
      } else if (state.plans.length === 0) {
        state.activeId = null;
      }
    },
    
    setActivePlan: (state, action) => {
      state.activeId = action.payload;
    },
    
    markDayComplete: (state, action) => {
      const { planId, date, pages } = action.payload;
      const planIndex = state.plans.findIndex(plan => plan.id === planId);
      
      if (planIndex !== -1) {
        const plan = state.plans[planIndex];
        const today = new Date(date).toISOString().split('T')[0];
        const lastReadDate = plan.progress.lastRead 
          ? new Date(plan.progress.lastRead).toISOString().split('T')[0] 
          : null;
        
        // Add today to completed days if not already there
        if (!plan.progress.completedDays.includes(today)) {
          plan.progress.completedDays.push(today);
        }
        
        // Update completed pages/juz
        plan.progress.completed += pages || 1;
        
        // Update streak
        if (lastReadDate) {
          const yesterday = new Date(date);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastReadDate === yesterdayStr) {
            // Continuing streak
            plan.progress.streak += 1;
          } else if (lastReadDate !== today) {
            // Broken streak
            plan.progress.streak = 1;
          }
        } else {
          // First day
          plan.progress.streak = 1;
        }
        
        // Update last read time
        plan.progress.lastRead = date;
      }
    }
  }
});

export const { 
  createPlan, 
  updateProgress, 
  updatePlan,
  deletePlan,
  setActivePlan,
  markDayComplete
} = readingPlansSlice.actions;

export default readingPlansSlice.reducer;
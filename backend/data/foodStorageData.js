// backend/data/foodStorageData.js

const foodStorageData = [
  // ========== MEAT ==========
  {
    foodName: "Ground Beef",
    category: "meat",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Store in coldest part of fridge", "Keep in original packaging until use"]
      },
      freezer: {
        time: "3-4 months",
        tips: ["Label with date", "Use freezer bags to prevent freezer burn"]
      }
    },
    important_notes: ["Cook to 160°F internal temperature", "Never refreeze if thawed at room temperature"]
  },
  {
    foodName: "Beef Steaks",
    category: "meat",
    storageGuidelines: {
      fridge: {
        time: "3-5 days",
        tips: ["Store on bottom shelf to prevent drips"]
      },
      freezer: {
        time: "6-12 months",
        tips: ["Wrap in freezer paper or vacuum seal"]
      }
    },
    important_notes: ["Thaw in refrigerator, never on counter"]
  },
  {
    foodName: "Pork Chops",
    category: "meat",
    storageGuidelines: {
      fridge: {
        time: "3-5 days",
        tips: ["Store in meat drawer if available"]
      },
      freezer: {
        time: "4-6 months",
        tips: ["Double wrap to prevent freezer burn"]
      }
    },
    important_notes: ["Cook to 145°F internal temperature"]
  },
  {
    foodName: "Bacon",
    category: "meat",
    storageGuidelines: {
      fridge: {
        time: "1 week opened, 2 weeks unopened",
        tips: ["Keep tightly sealed after opening"]
      },
      freezer: {
        time: "1 month",
        tips: ["Can freeze in original packaging"]
      }
    },
    important_notes: ["Can leave out cooked bacon for 2 hours maximum"]
  },

  // ========== POULTRY ==========
  {
    foodName: "Whole Chicken",
    category: "poultry",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Keep in original packaging", "Store on bottom shelf"]
      },
      freezer: {
        time: "12 months",
        tips: ["Freeze in original packaging up to 2 months, overwrap for longer"]
      }
    },
    important_notes: ["Cook to 165°F internal temperature", "Never wash raw chicken"]
  },
  {
    foodName: "Chicken Breasts/Thighs",
    category: "poultry",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Place on plate to catch drips"]
      },
      freezer: {
        time: "9 months",
        tips: ["Freeze individually for easy portioning"]
      }
    },
    important_notes: ["More perishable than beef", "Use separate cutting board"]
  },
  {
    foodName: "Ground Turkey",
    category: "poultry",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Use quickly as it spoils faster than whole pieces"]
      },
      freezer: {
        time: "3-4 months",
        tips: ["Flatten packages for faster freezing/thawing"]
      }
    },
    important_notes: ["Cook to 165°F", "More perishable than ground beef"]
  },
  {
    foodName: "Turkey (Whole)",
    category: "poultry",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Takes 24 hours per 4-5 pounds to thaw in fridge"]
      },
      freezer: {
        time: "12 months",
        tips: ["Keep in original wrapping"]
      }
    },
    important_notes: ["Never thaw at room temperature", "Cook immediately after thawing"]
  },

  // ========== SEAFOOD ==========
  {
    foodName: "Fresh Fish (Salmon, Cod, etc.)",
    category: "seafood",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Store on ice if possible", "Use within a day for best quality"]
      },
      freezer: {
        time: "2-3 months (fatty fish), 6 months (lean fish)",
        tips: ["Vacuum seal if possible", "Glaze with water for extra protection"]
      }
    },
    important_notes: ["Should smell like ocean, not 'fishy'", "Cook to 145°F"]
  },
  {
    foodName: "Shrimp",
    category: "seafood",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Keep in shell until ready to use"]
      },
      freezer: {
        time: "3-6 months",
        tips: ["Freeze in shell for best quality"]
      }
    },
    important_notes: ["Previously frozen shrimp should not be refrozen"]
  },
  {
    foodName: "Scallops",
    category: "seafood",
    storageGuidelines: {
      fridge: {
        time: "1-2 days",
        tips: ["Keep dry, moisture causes spoilage"]
      },
      freezer: {
        time: "3 months",
        tips: ["Pat dry before freezing"]
      }
    },
    important_notes: ["Fresh scallops should be slightly sweet smelling"]
  },
  {
    foodName: "Lobster",
    category: "seafood",
    storageGuidelines: {
      fridge: {
        time: "1-2 days (live), 3-4 days (cooked)",
        tips: ["Keep live lobsters in breathable container"]
      },
      freezer: {
        time: "3 months (cooked only)",
        tips: ["Never freeze live lobster"]
      }
    },
    important_notes: ["Cook live lobsters the day of purchase"]
  }
];

export { foodStorageData };

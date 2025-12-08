export const budgets = {
    mobile: {
        label: 'Mobile / Switch',
        description: 'Strict limits for low-end devices and handhelds.',
        assets: {
            character: { lod0: 5000, lod1: 2500, lod2: 1200, lod3: 600 },
            weapon: { lod0: 1500, lod1: 750, lod2: 300, lod3: 150 },
            prop_small: { lod0: 300, lod1: 150, lod2: 75, lod3: 30 },
            prop_large: { lod0: 1000, lod1: 500, lod2: 250, lod3: 100 },
            vehicle: { lod0: 8000, lod1: 4000, lod2: 2000, lod3: 1000 },
            environment: { lod0: 2000, lod1: 1000, lod2: 500, lod3: 250 }
        }
    },
    vr: {
        label: 'VR / Standalone',
        description: 'Optimized for high framerates (72-90fps) on standalone headsets.',
        assets: {
            character: { lod0: 15000, lod1: 7500, lod2: 3000, lod3: 1500 },
            weapon: { lod0: 3000, lod1: 1500, lod2: 750, lod3: 300 },
            prop_small: { lod0: 500, lod1: 250, lod2: 100, lod3: 50 },
            prop_large: { lod0: 2000, lod1: 1000, lod2: 500, lod3: 250 },
            vehicle: { lod0: 15000, lod1: 7500, lod2: 3500, lod3: 1500 },
            environment: { lod0: 5000, lod1: 2500, lod2: 1000, lod3: 500 }
        }
    },
    pc: {
        label: 'PC / PS4 / Xbox One',
        description: 'Standard high-fidelity budgets for last-gen consoles and mid-range PCs.',
        assets: {
            character: { lod0: 30000, lod1: 15000, lod2: 7500, lod3: 3000 },
            weapon: { lod0: 8000, lod1: 4000, lod2: 2000, lod3: 1000 },
            prop_small: { lod0: 1500, lod1: 750, lod2: 300, lod3: 150 },
            prop_large: { lod0: 5000, lod1: 2500, lod2: 1200, lod3: 600 },
            vehicle: { lod0: 30000, lod1: 15000, lod2: 7500, lod3: 3000 },
            environment: { lod0: 10000, lod1: 5000, lod2: 2500, lod3: 1000 }
        }
    },
    nextgen: {
        label: 'PS5 / Series X / High-End PC',
        description: 'High budgets for current-gen hardware. Nanite workflows may exceed this.',
        assets: {
            character: { lod0: 100000, lod1: 50000, lod2: 25000, lod3: 10000 },
            weapon: { lod0: 25000, lod1: 12500, lod2: 6000, lod3: 3000 },
            prop_small: { lod0: 5000, lod1: 2500, lod2: 1000, lod3: 500 },
            prop_large: { lod0: 20000, lod1: 10000, lod2: 5000, lod3: 2500 },
            vehicle: { lod0: 100000, lod1: 50000, lod2: 25000, lod3: 10000 },
            environment: { lod0: 50000, lod1: 25000, lod2: 10000, lod3: 5000 }
        }
    }
}

export const assetTypes = [
    { id: 'character', label: 'Character (Hero)' },
    { id: 'weapon', label: 'Weapon (First Person)' },
    { id: 'vehicle', label: 'Vehicle' },
    { id: 'prop_large', label: 'Prop (Large/Complex)' },
    { id: 'prop_small', label: 'Prop (Small/Simple)' },
    { id: 'environment', label: 'Environment Piece' }
]

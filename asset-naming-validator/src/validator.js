export const rules = {
    staticMesh: {
        id: 'staticMesh',
        label: 'Static Mesh',
        prefix: 'SM_',
        suffix: '',
        example: 'SM_Chair_01'
    },
    texture: {
        id: 'texture',
        label: 'Texture',
        prefix: 'T_',
        suffix: ['_D', '_N', '_M', '_R', '_ORM', '_BC'],
        example: 'T_Wood_D'
    },
    material: {
        id: 'material',
        label: 'Material',
        prefix: 'M_',
        suffix: '',
        example: 'M_Wood_Master'
    },
    materialInstance: {
        id: 'materialInstance',
        label: 'Material Instance',
        prefix: 'MI_',
        suffix: '',
        example: 'MI_Wood_Oak'
    },
    blueprint: {
        id: 'blueprint',
        label: 'Blueprint',
        prefix: 'BP_',
        suffix: '',
        example: 'BP_Door'
    },
    skeletalMesh: {
        id: 'skeletalMesh',
        label: 'Skeletal Mesh',
        prefix: 'SK_',
        suffix: '',
        example: 'SK_Hero'
    },
    animation: {
        id: 'animation',
        label: 'Animation',
        prefix: 'A_',
        suffix: '',
        example: 'A_Run_Fwd'
    }
}

export const validateName = (name, typeId) => {
    const rule = rules[typeId]
    if (!rule) return { isValid: false, error: 'Unknown asset type' }

    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Name cannot be empty' }
    }

    // Check Prefix
    if (!name.startsWith(rule.prefix)) {
        const suggestion = rule.prefix + name
        return {
            isValid: false,
            error: `Missing prefix "${rule.prefix}"`,
            suggestion: suggestion
        }
    }

    // Check Suffix (if applicable)
    if (Array.isArray(rule.suffix) && rule.suffix.length > 0) {
        const hasValidSuffix = rule.suffix.some(s => name.endsWith(s))
        if (!hasValidSuffix) {
            return {
                isValid: false,
                error: `Missing valid suffix (${rule.suffix.join(', ')})`,
                suggestion: name + rule.suffix[0] // Suggest first valid suffix
            }
        }
    }

    // Check Spaces
    if (name.includes(' ')) {
        return {
            isValid: false,
            error: 'Spaces are not allowed',
            suggestion: name.replace(/\s+/g, '_')
        }
    }

    return { isValid: true }
}

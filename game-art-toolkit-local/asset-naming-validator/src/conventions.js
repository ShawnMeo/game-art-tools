// Comprehensive naming conventions for game engines

export const conventions = {
    unreal: {
        id: 'unreal',
        name: 'Unreal Engine',
        format: 'Prefix_BaseAssetName_Variant_Suffix',
        formatDescription: 'All assets use PascalCase with underscores separating prefix, name, variant, and suffix.',
        assets: [
            {
                id: 'staticMesh',
                label: 'Static Mesh',
                icon: '🪑',
                description: 'Non-animated 3D geometry like props, architecture, and environment pieces.',
                prefix: 'SM_',
                suffix: null,
                examples: ['SM_Chair_01', 'SM_Wall_Brick_02', 'SM_Prop_Barrel']
            },
            {
                id: 'skeletalMesh',
                label: 'Skeletal Mesh',
                icon: '🦴',
                description: 'Rigged 3D models with a bone hierarchy for animation, like characters and creatures.',
                prefix: 'SK_',
                suffix: null,
                examples: ['SK_Hero_Male', 'SK_Enemy_Zombie', 'SK_Weapon_Sword']
            },
            {
                id: 'texture',
                label: 'Texture',
                icon: '🎨',
                description: '2D images applied to 3D surfaces. Uses suffixes to indicate map type.',
                prefix: 'T_',
                suffix: '_D, _N, _R, etc.',
                examples: ['T_Wood_D', 'T_Brick_N', 'T_Metal_ORM']
            },
            {
                id: 'material',
                label: 'Material',
                icon: '🎭',
                description: 'Defines surface appearance including shaders, textures, and visual properties.',
                prefix: 'M_',
                suffix: null,
                examples: ['M_Wood_Master', 'M_Glass_Frosted', 'M_Character_Skin']
            },
            {
                id: 'materialInstance',
                label: 'Material Instance',
                icon: '🎭',
                description: 'A variant of a parent material with modified parameters for performance.',
                prefix: 'MI_',
                suffix: null,
                examples: ['MI_Wood_Oak', 'MI_Metal_Rusty', 'MI_Brick_Red']
            },
            {
                id: 'blueprint',
                label: 'Blueprint',
                icon: '⚙️',
                description: 'Visual scripting assets containing logic, components, and game functionality.',
                prefix: 'BP_',
                suffix: null,
                examples: ['BP_Door_Interactive', 'BP_Pickup_Health', 'BP_Enemy_Base']
            },
            {
                id: 'animation',
                label: 'Animation Sequence',
                icon: '🏃',
                description: 'Keyframe animation data for skeletal meshes.',
                prefix: 'A_',
                suffix: null,
                examples: ['A_Run_Fwd', 'A_Jump_Start', 'A_Attack_Melee_01']
            },
            {
                id: 'animMontage',
                label: 'Animation Montage',
                icon: '🎬',
                description: 'Composite animations with sections, notifies, and blend logic.',
                prefix: 'AM_',
                suffix: null,
                examples: ['AM_Attack_Combo', 'AM_Reload', 'AM_Death_Ragdoll']
            },
            {
                id: 'animBlueprint',
                label: 'Animation Blueprint',
                icon: '📊',
                description: 'Visual script controlling animation state machines and blending.',
                prefix: 'ABP_',
                suffix: null,
                examples: ['ABP_Hero', 'ABP_Enemy_Humanoid', 'ABP_Vehicle']
            },
            {
                id: 'particleSystem',
                label: 'Particle System',
                icon: '✨',
                description: 'Visual effects using particle emitters (Niagara or Cascade).',
                prefix: 'PS_',
                suffix: null,
                examples: ['PS_Fire', 'PS_Explosion_Small', 'PS_Magic_Heal']
            },
            {
                id: 'niagaraSystem',
                label: 'Niagara System',
                icon: '🌟',
                description: 'Modern VFX system for complex particle effects.',
                prefix: 'NS_',
                suffix: null,
                examples: ['NS_Smoke_Chimney', 'NS_Sparks', 'NS_Blood_Splatter']
            },
            {
                id: 'sound',
                label: 'Sound Wave',
                icon: '🔊',
                description: 'Audio files imported into the engine.',
                prefix: 'S_',
                suffix: null,
                examples: ['S_Footstep_Concrete', 'S_Explosion_01', 'S_Music_MainTheme']
            },
            {
                id: 'soundCue',
                label: 'Sound Cue',
                icon: '🎵',
                description: 'Audio asset with logic for randomization, mixing, and modulation.',
                prefix: 'SC_',
                suffix: null,
                examples: ['SC_Footsteps', 'SC_Weapon_Fire', 'SC_Ambient_Forest']
            },
            {
                id: 'widget',
                label: 'Widget Blueprint',
                icon: '📱',
                description: 'UI elements created with UMG (Unreal Motion Graphics).',
                prefix: 'WBP_',
                suffix: null,
                examples: ['WBP_MainMenu', 'WBP_HealthBar', 'WBP_Inventory']
            },
            {
                id: 'level',
                label: 'Level / Map',
                icon: '🗺️',
                description: 'Playable game levels and maps.',
                prefix: 'L_',
                suffix: null,
                examples: ['L_MainMenu', 'L_Level01_Forest', 'L_Arena_PvP']
            },
            {
                id: 'physicsAsset',
                label: 'Physics Asset',
                icon: '💥',
                description: 'Collision and physics bodies for skeletal meshes.',
                prefix: 'PHYS_',
                suffix: null,
                examples: ['PHYS_Hero', 'PHYS_Ragdoll', 'PHYS_Vehicle']
            }
        ],
        textureSuffixes: [
            { suffix: '_D', meaning: 'Diffuse / Base Color', description: 'The main color texture' },
            { suffix: '_BC', meaning: 'Base Color', description: 'Alternative to _D for PBR workflows' },
            { suffix: '_N', meaning: 'Normal Map', description: 'Surface detail and bump information' },
            { suffix: '_R', meaning: 'Roughness', description: 'How rough/smooth the surface is' },
            { suffix: '_M', meaning: 'Metallic', description: 'Whether surface is metallic or not' },
            { suffix: '_AO', meaning: 'Ambient Occlusion', description: 'Soft shadows in crevices' },
            { suffix: '_H', meaning: 'Height / Displacement', description: 'For parallax or tessellation' },
            { suffix: '_E', meaning: 'Emissive', description: 'Self-illuminating areas' },
            { suffix: '_O', meaning: 'Opacity / Alpha', description: 'Transparency mask' },
            { suffix: '_ORM', meaning: 'Packed RGB', description: 'Occlusion (R), Roughness (G), Metallic (B)' },
            { suffix: '_RMA', meaning: 'Packed RGB', description: 'Roughness (R), Metallic (G), AO (B)' }
        ]
    },
    unity: {
        id: 'unity',
        name: 'Unity',
        format: 'Prefix_AssetName or PascalCase',
        formatDescription: 'Unity is more flexible. Common approaches use prefixes or rely on folder structure.',
        assets: [
            {
                id: 'model',
                label: '3D Model',
                icon: '🪑',
                description: 'Static or animated 3D meshes imported from external tools.',
                prefix: 'MOD_',
                suffix: null,
                examples: ['MOD_Chair', 'MOD_Tree_Oak_01', 'MOD_Building_House']
            },
            {
                id: 'prefab',
                label: 'Prefab',
                icon: '📦',
                description: 'Reusable game objects with components, settings, and children.',
                prefix: 'PFB_',
                suffix: null,
                examples: ['PFB_Enemy_Zombie', 'PFB_Pickup_Coin', 'PFB_Door']
            },
            {
                id: 'texture',
                label: 'Texture',
                icon: '🎨',
                description: '2D images used for materials, UI, or other purposes.',
                prefix: 'TEX_',
                suffix: '_Albedo, _Normal, etc.',
                examples: ['TEX_Wood_Albedo', 'TEX_Brick_Normal', 'TEX_Metal_Mask']
            },
            {
                id: 'material',
                label: 'Material',
                icon: '🎭',
                description: 'Defines how surfaces look using shaders and textures.',
                prefix: 'MAT_',
                suffix: null,
                examples: ['MAT_Wood', 'MAT_Character_Skin', 'MAT_Water']
            },
            {
                id: 'animation',
                label: 'Animation Clip',
                icon: '🏃',
                description: 'Keyframe animation data for any animated property.',
                prefix: 'ANM_',
                suffix: null,
                examples: ['ANM_Run', 'ANM_Jump', 'ANM_Attack_01']
            },
            {
                id: 'animController',
                label: 'Animator Controller',
                icon: '📊',
                description: 'State machine controlling animation transitions and blending.',
                prefix: 'AC_',
                suffix: null,
                examples: ['AC_Player', 'AC_Enemy', 'AC_UI_Button']
            },
            {
                id: 'audio',
                label: 'Audio Clip',
                icon: '🔊',
                description: 'Sound files for music, SFX, and voice.',
                prefix: 'AUD_',
                suffix: null,
                examples: ['AUD_Footstep_01', 'AUD_Music_Battle', 'AUD_UI_Click']
            },
            {
                id: 'script',
                label: 'C# Script',
                icon: '📜',
                description: 'MonoBehaviour scripts for game logic.',
                prefix: null,
                suffix: null,
                examples: ['PlayerController', 'EnemyAI', 'GameManager'],
                note: 'Use PascalCase, no prefix needed'
            },
            {
                id: 'scriptableObject',
                label: 'Scriptable Object',
                icon: '💾',
                description: 'Data containers for configurations and settings.',
                prefix: 'SO_',
                suffix: null,
                examples: ['SO_WeaponStats', 'SO_EnemyConfig', 'SO_LevelData']
            },
            {
                id: 'scene',
                label: 'Scene',
                icon: '🗺️',
                description: 'Game levels and environments.',
                prefix: 'SCN_',
                suffix: null,
                examples: ['SCN_MainMenu', 'SCN_Level_01', 'SCN_Cutscene_Intro']
            },
            {
                id: 'uiCanvas',
                label: 'UI Canvas',
                icon: '📱',
                description: 'UI layouts using Unity Canvas system.',
                prefix: 'UI_',
                suffix: null,
                examples: ['UI_MainMenu', 'UI_HUD', 'UI_Inventory']
            },
            {
                id: 'vfx',
                label: 'VFX / Particle',
                icon: '✨',
                description: 'Particle systems and visual effects.',
                prefix: 'VFX_',
                suffix: null,
                examples: ['VFX_Explosion', 'VFX_Fire', 'VFX_MagicAura']
            },
            {
                id: 'shader',
                label: 'Shader',
                icon: '🌈',
                description: 'Custom shader code or Shader Graph assets.',
                prefix: 'SHD_',
                suffix: null,
                examples: ['SHD_Toon', 'SHD_Water', 'SHD_Dissolve']
            },
            {
                id: 'renderTexture',
                label: 'Render Texture',
                icon: '🖼️',
                description: 'Textures rendered by cameras at runtime.',
                prefix: 'RT_',
                suffix: null,
                examples: ['RT_MiniMap', 'RT_SecurityCamera', 'RT_Mirror']
            }
        ],
        textureSuffixes: [
            { suffix: '_Albedo', meaning: 'Base Color', description: 'The main color texture' },
            { suffix: '_Diffuse', meaning: 'Diffuse Color', description: 'Legacy term for base color' },
            { suffix: '_Normal', meaning: 'Normal Map', description: 'Surface detail and bump information' },
            { suffix: '_Metallic', meaning: 'Metallic Map', description: 'Metallic property (often packed)' },
            { suffix: '_Smoothness', meaning: 'Smoothness', description: 'Inverse of roughness' },
            { suffix: '_AO', meaning: 'Ambient Occlusion', description: 'Soft shadows in crevices' },
            { suffix: '_Height', meaning: 'Height Map', description: 'For parallax or displacement' },
            { suffix: '_Emission', meaning: 'Emission', description: 'Self-illuminating areas' },
            { suffix: '_Mask', meaning: 'Mask Texture', description: 'Various masks (R, G, B channels)' },
            { suffix: '_MaskMap', meaning: 'HDRP Mask', description: 'Metallic (R), AO (G), Detail (B), Smoothness (A)' }
        ]
    }
}

<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    import ExpertiseDiePicker from "../components/ExpertiseDiePicker.svelte";
    import FormSection from "../components/FormSection.svelte";
    import OutputVisibilitySection from "../components/activationDialog/OutputVisibilitySection.svelte";
    import RadioGroup from "../components/RadioGroup.svelte";

    import getRollFormula from "../../utils/getRollFormula";
    import overrideRollMode from "../../utils/overrideRollMode";

    export let { actorDocument, abilityKey, dialog, options } =
        getContext("#external").application;

    const rollModeOptions = Object.entries(CONFIG.A5E.rollModes).map(
        ([key, value]) => [
            CONFIG.A5E.ROLL_MODE[key.toUpperCase()],
            localize(value),
        ]
    );

    const actor = new TJSDocument(actorDocument);
    const appId = dialog.id;

    const localizedAbility = localize(CONFIG.A5E.abilities[abilityKey]);
    const buttonText = localize("A5E.RollPromptAbilityCheck", {
        ability: localizedAbility,
    });

    function onSubmit() {
        dialog.submit({ expertiseDie, rollFormula, rollMode, visibilityMode });
    }

    let expertiseDie =
        options.expertiseDice ??
        $actor.system.abilities[abilityKey]?.check.expertiseDice;

    let selectedRollMode = options.rollMode ?? CONFIG.A5E.ROLL_MODE.NORMAL;

    let rollMode = overrideRollMode($actor, selectedRollMode, {
        ability: abilityKey,
        type: "check",
    });

    let visibilityMode =
        options.visibilityMode ?? game.settings.get("core", "rollMode");

    let rollFormula;
    let situationalMods = options.situationalMods ?? "";

    $: rollFormula = getRollFormula($actor, {
        ability: abilityKey,
        expertiseDie,
        rollMode,
        situationalMods,
        type: "abilityCheck",
    });
</script>

<form>
    <OutputVisibilitySection bind:visibilityMode />

    <FormSection heading="A5E.RollModeHeading">
        <RadioGroup
            options={rollModeOptions}
            selected={rollMode}
            on:updateSelection={({ detail }) => (rollMode = detail)}
        />
    </FormSection>

    <FormSection heading="A5E.ExpertiseDie">
        <ExpertiseDiePicker
            selected={expertiseDie}
            on:updateSelection={({ detail }) => (expertiseDie = detail)}
        />
    </FormSection>

    <FormSection heading="A5E.SituationalMods">
        <input
            class="a5e-input"
            type="text"
            id="{$actor.id}-{appId}-situational-mod"
            bind:value={situationalMods}
        />
    </FormSection>

    <section class="roll-formula-preview">
        {rollFormula}
    </section>

    <section>
        <button on:click|preventDefault={onSubmit}>{buttonText}</button>
    </section>
</form>

<style lang="scss">
    form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
    }

    .roll-formula-preview {
        padding: 0.5rem;
        font-size: $font-size-sm;
        border: 1px solid #7a7971;
        border-radius: 4px;
    }
</style>

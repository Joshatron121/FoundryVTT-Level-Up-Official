<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";

    import prepareAbilityOptions from "../../dataPreparationHelpers/prepareAbilityOptions";
    import updateDocumentDataFromField from "../../../utils/updateDocumentDataFromField";

    import Checkbox from "../Checkbox.svelte";
    import FormSection from "../FormSection.svelte";
    import RadioGroup from "../RadioGroup.svelte";

    export let roll;
    export let rollId;

    const item = getContext("item");
    const actionId = getContext("actionId");

    const tools = Object.entries(CONFIG.A5E.tools)
        .map(([_, tools]) => Object.entries(tools))
        .flat()
        .sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));

    function updateAbility() {
        updateDocumentDataFromField(
            $item,
            `system.actions.${actionId}.rolls.${rollId}.ability`,
            selectedAbility
        );
    }

    $: roll = $item.system.actions[actionId]?.rolls[rollId];
    $: selectedAbility = roll.ability ?? "none";
    $: selectedAbility, updateAbility();
</script>

<FormSection
    heading="A5E.Label"
    --background="none"
    --direction="column"
    --padding="0"
    --margin="0 4.5rem 0 0"
>
    <input
        type="text"
        value={roll.label ?? ""}
        on:change={({ target }) =>
            updateDocumentDataFromField(
                $item,
                `system.actions.${actionId}.rolls.${rollId}.label`,
                target.value
            )}
    />
</FormSection>

<FormSection
    heading="A5E.Tool"
    --background="none"
    --direction="column"
    --padding="0"
>
    <select
        class="u-w-fit"
        on:change={({ target }) =>
            updateDocumentDataFromField(
                $item,
                `system.actions.${actionId}.rolls.${rollId}.tool`,
                target.value
            )}
    >
        {#each tools as [tool, label]}
            <option value={tool} selected={roll?.tool === tool}>
                {localize(label)}
            </option>
        {/each}
    </select>
</FormSection>

<FormSection
    heading="A5E.DefaultAbilityScore"
    --background="none"
    --direction="column"
    --padding="0"
>
    <RadioGroup
        optionStyles="min-width: 2rem; text-align: center;"
        options={prepareAbilityOptions(false, true)}
        selected={selectedAbility}
        allowDeselect={false}
        on:updateSelection={({ detail }) => (selectedAbility = detail)}
    />
</FormSection>

<FormSection
    heading="A5E.CheckBonus"
    --background="none"
    --direction="column"
    --padding="0"
>
    <input
        type="text"
        value={roll.bonus ?? ""}
        on:change={({ target }) =>
            updateDocumentDataFromField(
                $item,
                `system.actions.${actionId}.rolls.${rollId}.bonus`,
                target.value
            )}
    />
</FormSection>

<Checkbox
    label="A5E.ToolCheckDefaultSelection"
    checked={roll.default ?? true}
    on:updateSelection={({ detail }) => {
        updateDocumentDataFromField(
            $item,
            `system.actions.${actionId}.rolls.${rollId}.default`,
            detail
        );
    }}
/>

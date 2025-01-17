<svelte:options accessors={true} />

<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    import CheckboxGroup from "../components/CheckboxGroup.svelte";
    import FormSection from "../components/FormSection.svelte";
    import RadioGroup from "../components/RadioGroup.svelte";
    import CustomTagGroup from "../components/CustomTagGroup.svelte";

    export let { application } = getContext("#external");
    export let { actorDocument, itemDocument } =
        getContext("#external").application;

    const actor = new TJSDocument(actorDocument);
    const item = new TJSDocument(itemDocument);
    const { A5E } = CONFIG;

    function submitForm() {
        application.submit({
            gifts,
            paragonGifts,
            selectedCreatureSize,
            selectedFeatures,
        });
    }

    let selectedCreatureSize = "";
    let selectedGiftCategory = "";
    let selectedParagonCategories = "";
    let selectedFeatures =
        Object.values($item.system.features ?? {}).map(({ uuid }) => uuid) ??
        [];

    $: gifts = Object.values($item.system.gifts).reduce((acc, gift) => {
        if (gift.category === selectedGiftCategory) acc.push(gift.uuid);
        return acc;
    }, []);

    $: paragonGifts = Object.values($item.system.paragonGifts).reduce(
        (acc, gift) => {
            if (gift.category === selectedParagonCategories)
                acc.push(gift.uuid);
            return acc;
        },
        []
    );

    $: features = Object.values($item.system.features).map((f) => {
        const data = fromUuidSync(f.uuid);
        return [f.uuid, data.name];
    });
    $: giftCategories = Object.entries($item.system.giftCategories).map(
        ([uuid, name]) => [uuid, name || "New Gift Category"]
    );
    $: paragonCategories = Object.entries($item.system.paragonCategories).map(
        ([uuid, name]) => [uuid, name || "New Paragon Category"]
    );
</script>

<form>
    <section>
        {#if $item.system.creatureSize.options.length}
            <FormSection
                heading="A5E.CreatureSizeLabel"
                warning="Creature Size not selected."
                showWarning={!selectedCreatureSize}
            >
                <RadioGroup
                    options={$item.system.creatureSize.options.map((s) => [
                        s,
                        A5E.actorSizes[s],
                    ])}
                    selected={selectedCreatureSize}
                    on:updateSelection={({ detail }) =>
                        (selectedCreatureSize = detail)}
                />
            </FormSection>
        {/if}

        <FormSection heading={localize("A5E.originSheets.heritage.traits")}>
            <CheckboxGroup
                options={features}
                selected={selectedFeatures}
                on:updateSelection={({ detail }) => (selectedFeatures = detail)}
            />
        </FormSection>

        <FormSection heading={localize("A5E.originSheets.heritage.gifts")}>
            <RadioGroup
                options={giftCategories}
                selected={selectedGiftCategory}
                on:updateSelection={({ detail }) =>
                    (selectedGiftCategory = detail)}
            />
        </FormSection>

        {#if $actor.system.details.level >= 10}
            <FormSection
                heading={localize("A5E.originSheets.heritage.paragonGifts")}
            >
                <RadioGroup
                    options={paragonCategories}
                    selected={selectedParagonCategories}
                    on:updateSelection={({ detail }) =>
                        (selectedParagonCategories = detail)}
                />
            </FormSection>
        {/if}
    </section>

    <div class="button-container">
        <button on:click|preventDefault={submitForm}>
            {localize("A5E.Submit")}
        </button>
    </div>
</form>

<style lang="scss">
    form {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 0.75rem;
        gap: 0.5rem;
        overflow: auto;
        height: min(90vh, 25rem);
    }

    section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    .button-container {
        display: flex;
    }
</style>

<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";

    import updateDocumentDataFromField from "../../../utils/updateDocumentDataFromField";

    import Checkbox from "../Checkbox.svelte";
    import FormSection from "../FormSection.svelte";
    import RadioGroup from "../RadioGroup.svelte";

    const item = getContext("item");

    let editMode = false;

    const featureTypes = CONFIG.A5E.featureTypes;
</script>

<section>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <header
        class="
            u-align-center
            u-flex
            u-font-serif
            u-gap-md
            u-mb-lg
            u-ml-xs
            u-pointer
            u-text-lg
            u-w-fit
        "
        on:click={() => (editMode = !editMode)}
    >
        <h3>{localize("A5E.TabFeatureProperties")}</h3>

        <i
            class="u-text-sm fas"
            class:fa-chevron-up={editMode}
            class:fa-edit={!editMode}
        />
    </header>

    {#if editMode}
        <div class="u-flex u-flex-col u-gap-md">
            <FormSection heading="A5E.FeatureTypePrompt">
                <RadioGroup
                    options={Object.entries(featureTypes)}
                    selected={$item.system.featureType}
                    on:updateSelection={(event) =>
                        updateDocumentDataFromField(
                            $item,
                            "system.featureType",
                            event.detail
                        )}
                />
            </FormSection>

            <FormSection --gap="0.5rem 1.25rem">
                <Checkbox
                    label="A5E.SpellConcentration"
                    checked={$item.system.concentration}
                    on:updateSelection={({ detail }) => {
                        updateDocumentDataFromField(
                            $item,
                            "system.concentration",
                            detail
                        );
                    }}
                />
            </FormSection>
        </div>
    {:else}
        <dl class="a5e-box u-flex u-flex-col u-gap-sm u-m-0 u-p-md u-text-sm">
            <div class="u-flex u-gap-md">
                <dt class="u-text-bold">
                    {localize("A5E.FeatureTypePrompt")}:
                </dt>
                <dd class="u-m-0 u-p-0">
                    {featureTypes[$item.system.featureType] ??
                        localize("A5E.None")}
                </dd>
            </div>
        </dl>
    {/if}
</section>

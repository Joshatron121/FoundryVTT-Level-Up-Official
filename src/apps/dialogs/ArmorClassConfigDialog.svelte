<script>
    import { getContext } from "svelte";
    import { localize } from "#runtime/svelte/helper";
    import { TJSDocument } from "#runtime/svelte/store/fvtt/document";

    import FormSection from "../components/FormSection.svelte";

    import getACComponents from "../../utils/getACComponents";
    import updateDocumentDataFromField from "../../utils/updateDocumentDataFromField";

    export let { actorDocument, appId } = getContext("#external").application;

    const actor = new TJSDocument(actorDocument);

    $: acFormula = getACComponents($actor);
</script>

<article>
    <div class="u-flex u-flex-col u-gap-md">
        <FormSection
            heading="A5E.armorClass.baseFormula"
            hint="For NPCs this value states their Natural Armor."
        >
            <div class="u-w-full">
                <input
                    class="a5e-input"
                    type="text"
                    name="system.attributes.ac.baseFormula"
                    value={$actor.system.attributes.ac.baseFormula}
                    on:change={({ target }) =>
                        updateDocumentDataFromField(
                            $actor,
                            target.name,
                            target.value
                        )}
                />
            </div>
        </FormSection>

        <div class="u-flex u-flex-col u-gap-sm">
            <h3 class="u-text-bold u-text-sm">
                {localize("A5E.armorClass.formula")}
            </h3>

            <div class="u-w-full ac-formula-preview">
                {acFormula}
            </div>
        </div>
    </div>
</article>

<style lang="scss">
    article {
        padding: 0.75rem;
    }

    .ac-formula-preview {
        padding: 0.5rem;
        font-size: $font-size-sm;
        border: 1px solid #7a7971;
        border-radius: 4px;
    }
</style>

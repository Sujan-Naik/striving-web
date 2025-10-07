import DocsList from "@/components/project/docs/DocsList";
import DocsCreate from "@/components/project/docs/DocsCreate";

export default function Page() {


    // await fetch(`/api/project/${project._id}/docs`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ content: 'Documentation preface', project: project._id })
    //   });

    // console.log(project.docs)

    return <div className={'center-column'} style={{width: '100%'}}>
        <DocsCreate/>
        <DocsList/>

    </div>
}
import {useProject} from "@/context/ProjectContext";
import ManualList from "@/components/project/manual/ManualList";
import ManualCreate from "@/components/project/manual/ManualCreate";

export default function Page(){


    // await fetch(`/api/project/${project._id}/manual`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ content: 'Documentation preface', project: project._id })
    //   });

    // console.log(project.manual)

    return <div className={'center-column'} style={{width: '100%'}}>
        <ManualCreate/>
                <ManualList/>

    </div>
}
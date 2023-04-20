import init from './tracer';
init('items-service');

import * as api from '@opentelemetry/api';
import axios from 'axios';
import * as express from 'express';

const app = express();

app.get('/data', async (request, response) => {
    try {
        if(request.query['fail']){
            throw new Error('A really bad error :/')
        }
        const user = await axios.get('http://localhost:8090/user');
        response.json(user.data);
    } catch (e) {
        const activeSpan = api.trace.getSpan(api.context.active());
        console.error(`Critical error`, { traceId: activeSpan.spanContext().traceId});
        response.sendStatus(500);
    }
})

app.listen(8080);
console.log('items services is up and running on port 8080');


